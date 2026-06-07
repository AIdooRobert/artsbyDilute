import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { beginPayment } from "@/app/actions/payment";
import { AuthShell } from "@/components/auth-shell";
import { StatusMessage } from "@/components/status-message";
import { formatCurrency } from "@/lib/data";
import { getPhotographerByUserId } from "@/lib/photographer";
import { getPaystackMode } from "@/lib/paystack";
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

  const { data: plan } = await admin
    .from("pricing_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();
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
        : query.error
          ? "The payment could not be prepared. Please try again."
          : undefined;

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
        <button className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50" disabled={!paymentAvailable}>
          <CreditCard size={17} />{" "}
          {paystackMode === "test"
            ? "Continue with Paystack test"
            : "Pay securely with Paystack"}
        </button>
      </form>
    </AuthShell>
  );
}
