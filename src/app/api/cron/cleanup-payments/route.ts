import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_SESSION_TTL_MS } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function hasValidCronSecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!secret || provided.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
}

export async function GET(request: NextRequest) {
  if (!hasValidCronSecret(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const stalePaymentCutoff = new Date(
    Date.now() - PAYMENT_SESSION_TTL_MS,
  ).toISOString();
  const rateLimitCutoff = new Date(
    Date.now() - 48 * 60 * 60 * 1000,
  ).toISOString();

  const { data: cancelled, error: paymentError } = await admin
    .from("subscriptions")
    .update({
      status: "cancelled",
      initialization_started_at: null,
      last_error: "Payment session expired before completion.",
      updated_at: new Date().toISOString(),
    })
    .eq("status", "pending")
    .lt("created_at", stalePaymentCutoff)
    .select("id, transaction_id");

  if (paymentError) {
    console.error("Scheduled payment cleanup failed:", paymentError.message);
    return NextResponse.json(
      { status: "error", message: "Unable to clean up payments." },
      { status: 500 },
    );
  }

  if (cancelled?.length) {
    const { error: eventError } = await admin.from("payment_events").insert(
      cancelled.map((subscription) => ({
        subscription_id: subscription.id,
        reference: subscription.transaction_id,
        event_type: "scheduled_cleanup",
        status: "cancelled",
        details: { reason: "payment_session_expired" },
      })),
    );
    if (eventError) {
      console.error("Unable to record cleanup events:", eventError.message);
    }
  }

  const { error: rateLimitError, count: removedRateLimits } = await admin
    .from("rate_limit_buckets")
    .delete({ count: "exact" })
    .lt("updated_at", rateLimitCutoff);

  if (rateLimitError) {
    console.error("Scheduled rate-limit cleanup failed:", rateLimitError.message);
  }

  return NextResponse.json({
    status: "ok",
    cancelled_payments: cancelled?.length ?? 0,
    removed_rate_limit_buckets: removedRateLimits ?? 0,
    checked_at: new Date().toISOString(),
  });
}
