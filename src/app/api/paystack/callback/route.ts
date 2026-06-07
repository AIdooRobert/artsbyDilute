import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import {
  activateSubscriptionPayment,
  recordPaymentEvent,
} from "@/lib/payments";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=reference`);
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    if (transaction.status !== "success") {
      await recordPaymentEvent({
        reference,
        eventType: "callback",
        status: "not_successful",
        details: { transaction_status: transaction.status },
      });
      return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=verification`);
    }

    const result = await activateSubscriptionPayment({
      reference,
      amountMinor: transaction.amount,
      currency: transaction.currency,
      channel: transaction.channel,
      source: "callback",
    });
    if (!["activated", "already_active"].includes(result)) {
      return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=verification`);
    }

    return NextResponse.redirect(`${siteUrl}/photographer/dashboard?payment=success`);
  } catch (error) {
    await recordPaymentEvent({
      reference,
      eventType: "callback",
      status: "error",
      details: {
        message: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
      },
    });
    return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=verification`);
  }
}
