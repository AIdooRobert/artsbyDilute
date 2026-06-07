import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { registerPhotographer } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { formatCurrency, getPricingPlans } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Photographer signup" };

export default async function PhotographerSignup({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const [query, plans] = await Promise.all([searchParams, getPricingPlans()]);
  const plan = plans.find((item) => item.id === query.plan) ?? plans[0];

  return (
    <AuthShell
      title="Create your studio"
      copy="Set up your photographer account, then complete the selected plan payment securely through Paystack."
      backHref="/pricing"
    >
      {query.error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {query.error}
        </div>
      ) : null}
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
      <form action={registerPhotographer} className="grid gap-4">
        <input type="hidden" name="plan_id" value={plan.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Your name
            <input name="photographer_name" className="field" required />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Business name
            <input name="business_name" className="field" required />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Email address
          <input name="email" type="email" className="field" required />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Username
          <input name="username" className="field" minLength={3} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Password
            <input name="password" type="password" className="field" minLength={8} required />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Confirm password
            <input name="confirm_password" type="password" className="field" minLength={8} required />
          </label>
        </div>
        <button className="button-primary mt-2 w-full">
          Continue to payment <ArrowRight size={17} />
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-black/50">
        Already registered?{" "}
        <Link href="/photographer/login" className="font-bold text-copper">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
