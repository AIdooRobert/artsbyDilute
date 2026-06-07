"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getPhotographerByUserId } from "@/lib/photographer";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function beginPayment(formData: FormData) {
  const user = await requireRole("photographer");
  const photographer = await getPhotographerByUserId(user.id);
  if (!photographer) redirect("/photographer/login");

  const admin = createAdminClient();
  const requestedPlanId = String(formData.get("plan_id") ?? photographer.pricing_plan_id ?? "");
  const existingSubscriptionId = String(formData.get("subscription_id") ?? "");

  const { data: plan } = await admin
    .from("pricing_plans")
    .select("*")
    .eq("id", requestedPlanId)
    .eq("is_active", true)
    .maybeSingle();
  if (!plan) redirect("/pricing?error=plan");

  let subscriptionId = existingSubscriptionId;
  let reference = "";

  if (existingSubscriptionId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("*")
      .eq("id", existingSubscriptionId)
      .eq("photographer_id", photographer.id)
      .eq("status", "pending")
      .maybeSingle();
    if (!subscription) redirect("/photographer/checkout?error=subscription");
    reference = subscription.transaction_id;
  } else {
    reference = `UPGRADE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const { data: subscription } = await admin
      .from("subscriptions")
      .insert({
        photographer_id: photographer.id,
        pricing_plan_id: plan.id,
        amount: plan.price_min,
        status: "pending",
        transaction_id: reference,
        metadata: { kind: "upgrade" },
      })
      .select()
      .single();
    if (!subscription) redirect("/photographer/checkout?error=subscription");
    subscriptionId = subscription.id;
  }

  if (!process.env.PAYSTACK_SECRET_KEY && process.env.ALLOW_TEST_PAYMENTS === "true") {
    await admin
      .from("subscriptions")
      .update({
        status: "active",
        renewal_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      })
      .eq("id", subscriptionId);
    await admin
      .from("photographers")
      .update({ pricing_plan_id: plan.id, is_active: true })
      .eq("id", photographer.id);
    redirect("/photographer/dashboard?payment=success");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const transaction = await initializePaystackTransaction({
    email: photographer.email,
    amount: Number(plan.price_min),
    reference,
    callbackUrl: `${siteUrl}/api/paystack/callback`,
    metadata: {
      subscription_id: subscriptionId,
      photographer_id: photographer.id,
      plan_id: plan.id,
    },
  });

  redirect(transaction.authorization_url);
}
