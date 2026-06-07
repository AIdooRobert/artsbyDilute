"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getPhotographerByUserId } from "@/lib/photographer";
import { getPaystackMode, initializePaystackTransaction } from "@/lib/paystack";
import {
  activateSubscriptionPayment,
  hasReusablePaymentAuthorization,
  PAYMENT_SESSION_TTL_MS,
  recordPaymentEvent,
} from "@/lib/payments";
import { checkRateLimit } from "@/lib/rate-limit";

function checkoutErrorUrl(
  error: string,
  planId: string,
  subscriptionId?: string,
) {
  const params = new URLSearchParams({ error, plan: planId });
  if (subscriptionId) params.set("subscription", subscriptionId);
  return `/photographer/checkout?${params.toString()}`;
}

export async function beginPayment(formData: FormData) {
  const user = await requireRole("photographer");
  const rateLimitAllowed = await checkRateLimit(
    "payment",
    { limit: 6, windowSeconds: 5 * 60 },
    user.id,
  );
  if (!rateLimitAllowed) {
    redirect("/photographer/checkout?error=rate-limit");
  }

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

  const paystackMode = getPaystackMode();
  const allowTestBypass =
    paystackMode === "unconfigured" &&
    process.env.ALLOW_TEST_PAYMENTS === "true";
  if (paystackMode === "unconfigured" && !allowTestBypass) {
    redirect(
      checkoutErrorUrl(
        "payment-unavailable",
        plan.id,
        existingSubscriptionId,
      ),
    );
  }

  const staleCutoff = new Date(
    Date.now() - PAYMENT_SESSION_TTL_MS,
  ).toISOString();
  await admin
    .from("subscriptions")
    .update({
      status: "cancelled",
      last_error: "Payment session expired before completion.",
    })
    .eq("photographer_id", photographer.id)
    .eq("status", "pending")
    .lt("created_at", staleCutoff);

  let subscription:
    | {
        id: string;
        transaction_id: string;
        authorization_url: string | null;
        expires_at: string | null;
      }
    | null = null;
  if (existingSubscriptionId) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, transaction_id, authorization_url, expires_at")
      .eq("id", existingSubscriptionId)
      .eq("photographer_id", photographer.id)
      .eq("pricing_plan_id", plan.id)
      .eq("status", "pending")
      .maybeSingle();
    subscription = data;
  }

  if (!subscription) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, transaction_id, authorization_url, expires_at")
      .eq("photographer_id", photographer.id)
      .eq("pricing_plan_id", plan.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    subscription = data;
  }

  if (!subscription) {
    const reference = `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const { data } = await admin
      .from("subscriptions")
      .insert({
        photographer_id: photographer.id,
        pricing_plan_id: plan.id,
        amount: plan.price_min,
        status: "pending",
        transaction_id: reference,
        metadata: { kind: "upgrade" },
      })
      .select("id, transaction_id, authorization_url, expires_at")
      .single();
    subscription = data;
  }

  if (!subscription?.transaction_id) {
    redirect(checkoutErrorUrl("subscription", plan.id));
  }
  const subscriptionId = subscription.id;
  const reference = subscription.transaction_id;

  if (hasReusablePaymentAuthorization(subscription)) {
    redirect(subscription.authorization_url!);
  }

  if (allowTestBypass) {
    await activateSubscriptionPayment({
      reference,
      amountMinor: Math.round(Number(plan.price_min) * 100),
      currency: plan.currency,
      channel: "test_bypass",
      source: "test_bypass",
    });
    redirect("/photographer/dashboard?payment=success");
  }

  const initializationLockCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: claimed } = await admin
    .from("subscriptions")
    .update({
      initialization_started_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", subscriptionId)
    .eq("status", "pending")
    .or(
      `initialization_started_at.is.null,initialization_started_at.lt.${initializationLockCutoff}`,
    )
    .select("id")
    .maybeSingle();

  if (!claimed) {
    redirect(checkoutErrorUrl("payment-processing", plan.id, subscriptionId));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let authorizationUrl: string;
  try {
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
    authorizationUrl = transaction.authorization_url;
    const initializedAt = new Date();
    await admin
      .from("subscriptions")
      .update({
        authorization_url: transaction.authorization_url,
        access_code: transaction.access_code,
        initialized_at: initializedAt.toISOString(),
        initialization_started_at: null,
        expires_at: new Date(
          initializedAt.getTime() + PAYMENT_SESSION_TTL_MS,
        ).toISOString(),
        last_error: null,
      })
      .eq("id", subscriptionId);
    await recordPaymentEvent({
      subscriptionId,
      reference,
      eventType: "initialize",
      status: "success",
      details: { paystack_mode: paystackMode },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown initialization error";
    console.error(
      "Paystack initialization failed:",
      message,
    );
    await admin
      .from("subscriptions")
      .update({
        initialization_started_at: null,
        last_error: message.slice(0, 500),
      })
      .eq("id", subscriptionId);
    await recordPaymentEvent({
      subscriptionId,
      reference,
      eventType: "initialize",
      status: "failed",
      details: { message: message.slice(0, 500), paystack_mode: paystackMode },
    });
    redirect(checkoutErrorUrl("payment-init", plan.id, subscriptionId));
  }

  redirect(authorizationUrl);
}
