import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=reference`);
  }

  try {
    const admin = createAdminClient();
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("*, pricing_plans(*)")
      .eq("transaction_id", reference)
      .eq("status", "pending")
      .maybeSingle();

    if (!subscription) {
      return NextResponse.redirect(`${siteUrl}/photographer/dashboard?payment=already-processed`);
    }

    const transaction = await verifyPaystackTransaction(reference);
    const expectedAmount = Math.round(Number(subscription.amount) * 100);
    if (
      transaction.status !== "success" ||
      transaction.amount !== expectedAmount ||
      transaction.currency !== (subscription.pricing_plans?.currency ?? "GHS")
    ) {
      await admin.from("subscriptions").update({ status: "failed" }).eq("id", subscription.id);
      return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=verification`);
    }

    await admin
      .from("subscriptions")
      .update({
        status: "active",
        payment_method: transaction.channel ?? "paystack",
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

    return NextResponse.redirect(`${siteUrl}/photographer/dashboard?payment=success`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/photographer/checkout?error=verification`);
  }
}
