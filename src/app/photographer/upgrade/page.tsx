import { PricingCard } from "@/components/pricing-card";
import { PortalShell } from "@/components/portal-shell";
import { SectionHeading } from "@/components/section-heading";
import { getPricingPlans } from "@/lib/data";
import { getPhotographerByUserId } from "@/lib/photographer";
import { requireRole } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const user = await requireRole("photographer");
  const [photographer, plans] = await Promise.all([
    getPhotographerByUserId(user.id),
    getPricingPlans(),
  ]);
  if (!photographer) return null;

  return (
    <PortalShell name={photographer.photographer_name}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Plans and billing"
          title="Give your studio room to grow."
          copy="A successful payment updates limits and features immediately after server-side verification."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} currentPlanId={photographer.pricing_plan_id ?? undefined} />
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
