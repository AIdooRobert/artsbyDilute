import { createAdminClient } from "@/lib/supabase/server";

export const PAYMENT_SESSION_TTL_MS = 23 * 60 * 60 * 1000;

type PaymentSubscription = {
  id: string;
  transaction_id: string | null;
  authorization_url: string | null;
  expires_at: string | null;
};

export function hasReusablePaymentAuthorization(
  subscription: PaymentSubscription,
  now = Date.now(),
) {
  if (!subscription.authorization_url || !subscription.expires_at) return false;
  return new Date(subscription.expires_at).getTime() > now;
}

export async function recordPaymentEvent(input: {
  subscriptionId?: string | null;
  reference?: string | null;
  eventType: string;
  status: string;
  details?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("payment_events").insert({
    subscription_id: input.subscriptionId || null,
    reference: input.reference || null,
    event_type: input.eventType,
    status: input.status,
    details: input.details ?? {},
  });
  if (error) console.error("Unable to record payment event:", error.message);
}

export async function activateSubscriptionPayment(input: {
  reference: string;
  amountMinor: number;
  currency: string;
  channel?: string;
  source: "callback" | "webhook" | "test_bypass";
}) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("activate_subscription_payment", {
    p_reference: input.reference,
    p_amount_minor: input.amountMinor,
    p_currency: input.currency,
    p_channel: input.channel ?? "paystack",
    p_source: input.source,
  });

  if (error) throw error;
  return String(data);
}
