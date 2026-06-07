import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import type { PricingPlan } from "@/lib/types";

export function PricingCard({
  plan,
  currentPlanId,
}: {
  plan: PricingPlan;
  currentPlanId?: string;
}) {
  const featured = plan.sort_order === 2;
  const current = currentPlanId === plan.id;
  const href = currentPlanId
    ? `/photographer/checkout?plan=${plan.id}&mode=upgrade`
    : `/photographer/signup?plan=${plan.id}`;

  return (
    <article
      className={`relative flex h-full flex-col rounded-[1.6rem] border p-7 ${
        featured
          ? "border-copper bg-cream shadow-[0_25px_80px_rgba(188,109,62,.16)]"
          : "border-black/10 bg-white"
      }`}
    >
      {featured ? (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-copper px-3 py-1 text-xs font-bold text-white">
          <Sparkles size={13} /> Most popular
        </span>
      ) : null}
      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-copper">
          {plan.name}
        </p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-black/55">{plan.description}</p>
      </div>
      <div className="mt-7 border-y border-black/8 py-6">
        <span className="display-title text-4xl">{formatCurrency(plan.price_min, plan.currency)}</span>
        <span className="ml-1 text-sm text-black/48">/{plan.billing_period}</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-black/[0.035] p-4 text-sm">
        <div>
          <strong className="block text-lg">
            {plan.max_galleries >= 999 ? "Unlimited" : plan.max_galleries}
          </strong>
          <span className="text-black/48">Galleries</span>
        </div>
        <div>
          <strong className="block text-lg">{plan.max_storage_gb} GB</strong>
          <span className="text-black/48">Storage</span>
        </div>
      </div>
      <ul className="my-7 grid flex-1 gap-3 text-sm text-black/68">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={17} className="mt-0.5 shrink-0 text-sage" />
            {feature}
          </li>
        ))}
      </ul>
      {current ? (
        <span className="button-secondary cursor-default">Current plan</span>
      ) : (
        <Link href={href} className="button-primary w-full">
          {currentPlanId ? "Choose this plan" : "Start with this plan"}
        </Link>
      )}
    </article>
  );
}
