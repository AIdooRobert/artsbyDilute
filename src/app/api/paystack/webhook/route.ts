import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type PaystackWebhook = {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    status?: string;
    channel?: string;
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

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("transaction_id", payload.data.reference)
    .maybeSingle();

  if (
    subscription &&
    subscription.status === "pending" &&
    payload.data.status === "success" &&
    payload.data.amount === Math.round(Number(subscription.amount) * 100)
  ) {
    await admin
      .from("subscriptions")
      .update({
        status: "active",
        payment_method: payload.data.channel ?? "paystack",
        renewal_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      })
      .eq("id", subscription.id);
    await admin
      .from("photographers")
      .update({
        is_active: true,
        pricing_plan_id: subscription.pricing_plan_id,
      })
      .eq("id", subscription.photographer_id);
  }

  return NextResponse.json({ received: true });
}
