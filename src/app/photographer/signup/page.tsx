import Link from "next/link";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { PhotographerSignupForm } from "@/components/photographer-signup-form";
import { formatCurrency, getPricingPlans } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Photographer signup" };

export default async function PhotographerSignup({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const [query, plans] = await Promise.all([searchParams, getPricingPlans()]);
  const requestedPlan = query.plan?.toLowerCase();
  const plan =
    plans.find(
      (item) =>
        item.id.toLowerCase() === requestedPlan ||
        item.slug.toLowerCase() === requestedPlan,
    ) ?? plans[0];

  return (
    <AuthShell
      title="Create your studio"
      copy="Set up your photographer account, then complete the selected plan payment securely through Paystack."
      backHref="/pricing"
    >
      <div className="mb-6 rounded-2xl bg-cream p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-copper">
              Selected plan
            </p>
            <h2 className="mt-1 text-xl font-black">{plan.name}</h2>
          </div>
          <p className="display-title text-2xl">
            {formatCurrency(plan.price_min, plan.currency)}
            <span className="font-sans text-xs text-black/45">/{plan.billing_period}</span>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-black/55">
          <span className="flex items-center gap-1">
            <Check size={14} /> {plan.max_galleries >= 999 ? "Unlimited" : plan.max_galleries} galleries
          </span>
          <span className="flex items-center gap-1">
            <Check size={14} /> {plan.max_storage_gb} GB storage
          </span>
        </div>
      </div>
      <PhotographerSignupForm planSlug={plan.slug} initialError={query.error} />
      <p className="mt-5 text-center text-sm text-black/50">
        Already registered?{" "}
        <Link href="/photographer/login" className="font-bold text-copper">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
