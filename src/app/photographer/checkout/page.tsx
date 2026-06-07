import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { beginPayment } from "@/app/actions/payment";
import { AuthShell } from "@/components/auth-shell";
import { StatusMessage } from "@/components/status-message";
import { formatCurrency } from "@/lib/data";
import { getPhotographerByUserId } from "@/lib/photographer";
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

  return (
    <AuthShell
      title="Complete your payment"
      copy="Paystack handles the payment securely. SnapFolio verifies both the status and amount before activating the plan."
      backHref={photographer.is_active ? "/photographer/upgrade" : "/pricing"}
    >
      <StatusMessage error={query.error ? "The payment could not be prepared. Please try again." : undefined} />
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
        <button className="button-primary w-full">
          <CreditCard size={17} /> Pay securely with Paystack
        </button>
      </form>
    </AuthShell>
  );
}
