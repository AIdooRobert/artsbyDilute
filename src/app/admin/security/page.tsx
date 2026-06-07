import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { changeAdminPassword } from "@/app/actions/auth";
import { AdminShell } from "@/components/admin-shell";
import { PasswordField } from "@/components/password-field";
import { StatusMessage } from "@/components/status-message";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Superadmin security" };

export default async function AdminSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  if (!user) redirect("/admin/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return (
    <AdminShell name={profile.display_name ?? user.email ?? "Superadmin"}>
      <div className="mx-auto max-w-xl">
        <span className="eyebrow">Account security</span>
        <h1 className="display-title mt-3 text-4xl">Change your password</h1>
        <p className="mt-3 text-sm leading-7 text-black/55">
          Use a unique password with at least 12 characters. You will be signed
          out after the update so the old session can no longer be reused.
        </p>
        <div className="mt-5">
          <StatusMessage error={query.error} />
        </div>
        <form action={changeAdminPassword} className="card mt-6 grid gap-5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-bold text-copper">
            <ShieldCheck size={18} /> Superadmin account
          </div>
          <PasswordField
            name="password"
            label="New password"
            autoComplete="new-password"
            minLength={12}
            showStrength
          />
          <PasswordField
            name="confirm_password"
            label="Confirm password"
            autoComplete="new-password"
            minLength={12}
          />
          <SubmitButton
            className="button-primary w-full disabled:cursor-wait disabled:opacity-60"
            pendingLabel="Securing account..."
          >
            Update password and sign out
          </SubmitButton>
        </form>
      </div>
    </AdminShell>
  );
}
