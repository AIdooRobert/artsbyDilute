import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { beginPayment } from "@/app/actions/payment";
import { AuthShell } from "@/components/auth-shell";
import { StatusMessage } from "@/components/status-message";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency } from "@/lib/data";
import { getPhotographerByUserId } from "@/lib/photographer";
import { getPaystackMode } from "@/lib/paystack";
import { hasReusablePaymentAuthorization } from "@/lib/payments";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    subscription?: string;
    plan?: string;
    pending?: string;
    error?: string;
  }>;
}) {
  const query = await searchParams;
  const user = await requireRole("photographer");
  const photographer = await getPhotographerByUserId(user.id);
  if (!photographer) return null;

  const admin = createAdminClient();
  let subscriptionId = query.subscription;
  let planId = query.plan ?? photographer.pricing_plan_id ?? undefined;

  if (!subscriptionId && query.pending) {
    const { data: pending } = await admin
      .from("subscriptions")
      .select("id, pricing_plan_id")
      .eq("photographer_id", photographer.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    subscriptionId = pending?.id;
    planId = pending?.pricing_plan_id ?? planId;
  }

  const [{ data: plan }, { data: paymentSession }] = await Promise.all([
    admin.from("pricing_plans").select("*").eq("id", planId).maybeSingle(),
    subscriptionId
      ? admin
          .from("subscriptions")
          .select(
            "id, transaction_id, authorization_url, expires_at, initialized_at, last_error",
          )
          .eq("id", subscriptionId)
          .eq("photographer_id", photographer.id)
          .eq("status", "pending")
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const paystackMode = getPaystackMode();
  const testBypassEnabled =
    paystackMode === "unconfigured" &&
    process.env.ALLOW_TEST_PAYMENTS === "true";
  const paymentAvailable =
    paystackMode !== "unconfigured" || testBypassEnabled;
  const checkoutError =
    query.error === "payment-unavailable"
      ? "Paystack is not configured yet. Please contact the administrator."
      : query.error === "payment-init"
        ? "Paystack could not start the payment. Please try again shortly."
        : query.error === "payment-processing"
          ? "A payment session is already being prepared. Wait a moment, then try again."
          : query.error === "rate-limit"
            ? "Too many payment attempts. Please wait a few minutes before trying again."
        : query.error
          ? "The payment could not be prepared. Please try again."
          : undefined;
  const canResume = paymentSession
    ? hasReusablePaymentAuthorization(paymentSession)
    : false;

  return (
    <AuthShell
      title="Complete your payment"
      copy="Paystack handles the payment securely. SnapFolio verifies both the status and amount before activating the plan."
      backHref={photographer.is_active ? "/photographer/upgrade" : "/pricing"}
    >
      <StatusMessage
        error={
          checkoutError ??
          (!paymentAvailable
            ? "Paystack is not configured yet. Please contact the administrator."
            : undefined)
        }
      />
      {paystackMode === "test" ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Paystack test mode is active. Use Paystack test payment details; no real
          money will be charged.
        </div>
      ) : null}
      {canResume ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          Your previous Paystack session is still available. Continue below to
          resume it without creating another payment.
        </div>
      ) : null}
      <div className="rounded-2xl bg-cream p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-copper">
              Order summary
            </p>
            <h2 className="mt-2 text-xl font-black">{plan?.name ?? "Selected plan"}</h2>
            <p className="mt-1 text-sm text-black/50">{photographer.business_name}</p>
          </div>
          <p className="display-title text-3xl">
            {formatCurrency(Number(plan?.price_min ?? 0), plan?.currency)}
          </p>
        </div>
      </div>
      <div className="my-6 grid gap-3 text-sm text-black/58">
        <p className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-copper" /> Server-side transaction initialization
        </p>
        <p className="flex items-center gap-2">
          <LockKeyhole size={17} className="text-copper" /> Amount verified before activation
        </p>
      </div>
      <form action={beginPayment}>
        <input type="hidden" name="plan_id" value={plan?.id ?? ""} />
        <input type="hidden" name="subscription_id" value={subscriptionId ?? ""} />
        <SubmitButton
          className="button-primary w-full disabled:cursor-wait disabled:opacity-50"
          disabled={!paymentAvailable}
          pendingLabel="Opening Paystack..."
        >
          <CreditCard size={17} />{" "}
          {canResume
            ? "Resume Paystack checkout"
            : paystackMode === "test"
              ? "Continue with Paystack test"
              : "Pay securely with Paystack"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
