import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  activateSubscriptionPayment,
  recordPaymentEvent,
} from "@/lib/payments";

type PaystackWebhook = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
    channel?: string;
    currency?: string;
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new NextResponse("Not configured", { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return new NextResponse("Invalid signature", { status: 401 });

  const payload = JSON.parse(rawBody) as PaystackWebhook;
  if (payload.event !== "charge.success" || !payload.data?.reference) {
    return NextResponse.json({ received: true });
  }

  if (payload.data.status === "success" && payload.data.amount) {
    try {
      await activateSubscriptionPayment({
        reference: payload.data.reference,
        amountMinor: payload.data.amount,
        currency: payload.data.currency ?? "GHS",
        channel: payload.data.channel,
        source: "webhook",
      });
    } catch (error) {
      await recordPaymentEvent({
        reference: payload.data.reference,
        eventType: "webhook",
        status: "error",
        details: {
          message: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
        },
      });
      return new NextResponse("Unable to process event", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
