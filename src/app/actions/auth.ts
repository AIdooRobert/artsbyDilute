"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  identifier: z.string().trim().min(2).max(160),
  password: z.string().min(6).max(128),
});

function loginPath(role: "admin" | "photographer" | "client", error: string) {
  return `/${role}/login?error=${encodeURIComponent(error)}`;
}

export async function login(
  role: "admin" | "photographer" | "client",
  formData: FormData,
) {
  if (!hasSupabaseEnv()) redirect(loginPath(role, "Connect Supabase before signing in."));

  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect(loginPath(role, "Enter valid credentials."));

  const admin = createAdminClient();
  let email = parsed.data.identifier.toLowerCase();

  if (!email.includes("@")) {
    if (role === "photographer") {
      const { data } = await admin
        .from("photographers")
        .select("email")
        .eq("username", email)
        .maybeSingle();
      email = data?.email ?? "";
    } else if (role === "client") {
      const { data } = await admin
        .from("photography_clients")
        .select("username")
        .eq("username", email)
        .eq("is_active", true)
        .maybeSingle();
      email = data ? `${data.username}@clients.snapfolio.local` : "";
    } else {
      redirect(loginPath(role, "Admins sign in with an email address."));
    }
  }

  if (!email) redirect(loginPath(role, "Invalid username or password."));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error || !data.user) redirect(loginPath(role, "Invalid username or password."));

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== role) {
    await supabase.auth.signOut();
    redirect(loginPath(role, "This account cannot access that portal."));
  }

  if (role === "photographer") {
    const { data: photographer } = await admin
      .from("photographers")
      .select("is_active")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();
    if (!photographer?.is_active) redirect("/photographer/checkout?pending=1");
  }

  redirect(role === "admin" ? "/admin" : `/${role}/dashboard`);
}

const signupSchema = z
  .object({
    planId: z.string().uuid(),
    photographerName: z.string().trim().min(2).max(120),
    businessName: z.string().trim().min(2).max(160),
    email: z.string().trim().email(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function registerPhotographer(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/photographer/signup?error=Connect+Supabase+before+registering.");
  }

  const parsed = signupSchema.safeParse({
    planId: formData.get("plan_id"),
    photographerName: formData.get("photographer_name"),
    businessName: formData.get("business_name"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check the form.";
    redirect(`/photographer/signup?plan=${formData.get("plan_id")}&error=${encodeURIComponent(message)}`);
  }

  const input = parsed.data;
  const admin = createAdminClient();
  const [{ data: existingUsername }, { data: plan }] = await Promise.all([
    admin.from("photographers").select("id").eq("username", input.username.toLowerCase()).maybeSingle(),
    admin.from("pricing_plans").select("*").eq("id", input.planId).eq("is_active", true).maybeSingle(),
  ]);

  if (existingUsername) {
    redirect(`/photographer/signup?plan=${input.planId}&error=Username+already+exists.`);
  }
  if (!plan) redirect("/pricing?error=plan");

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "photographer",
      display_name: input.photographerName,
    },
  });

  if (authError || !authData.user) {
    redirect(
      `/photographer/signup?plan=${input.planId}&error=${encodeURIComponent(authError?.message ?? "Unable to create account.")}`,
    );
  }

  await admin
    .from("profiles")
    .update({ role: "photographer", display_name: input.photographerName })
    .eq("id", authData.user.id);

  const { data: photographer, error: profileError } = await admin
    .from("photographers")
    .insert({
      auth_user_id: authData.user.id,
      username: input.username.toLowerCase(),
      photographer_name: input.photographerName,
      business_name: input.businessName,
      email: input.email.toLowerCase(),
      pricing_plan_id: input.planId,
      is_active: false,
    })
    .select()
    .single();

  if (profileError || !photographer) {
    await admin.auth.admin.deleteUser(authData.user.id);
    redirect(
      `/photographer/signup?plan=${input.planId}&error=${encodeURIComponent(profileError?.message ?? "Unable to create profile.")}`,
    );
  }

  const reference = `SIGNUP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: subscription, error: subscriptionError } = await admin
    .from("subscriptions")
    .insert({
      photographer_id: photographer.id,
      pricing_plan_id: input.planId,
      amount: plan.price_min,
      status: "pending",
      transaction_id: reference,
      metadata: { kind: "signup" },
    })
    .select()
    .single();

  if (subscriptionError || !subscription) {
    await admin.auth.admin.deleteUser(authData.user.id);
    redirect(
      `/photographer/signup?plan=${input.planId}&error=Unable+to+start+subscription.`,
    );
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase(),
    password: input.password,
  });

  redirect(`/photographer/checkout?subscription=${subscription.id}`);
}

export async function requestPasswordReset(
  role: "admin" | "photographer",
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !hasSupabaseEnv()) redirect(`/${role}/forgot-password?sent=1`);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/update-password`,
  });
  redirect(`/${role}/forgot-password?sent=1`);
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  if (password.length < 8 || password !== confirm) {
    redirect("/auth/update-password?error=Passwords+must+match+and+contain+8+characters.");
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  redirect(error ? `/auth/update-password?error=${encodeURIComponent(error.message)}` : "/photographer/login?reset=1");
}

export async function logout() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
