import { PricingCard } from "@/components/pricing-card";
import { ProductFooter } from "@/components/product-footer";
import { ProductHeader } from "@/components/product-header";
import { SectionHeading } from "@/components/section-heading";
import { getPricingPlans } from "@/lib/data";

export const metadata = { title: { absolute: "SnapFolio Pricing" } };
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <>
      <ProductHeader />
      <main className="bg-cream py-20 sm:py-28">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Simple pricing"
            title="A plan for every stage of your photography business."
            copy="Every plan includes secure client galleries and full-resolution delivery. Upgrade whenever your studio grows."
            center
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </main>
      <ProductFooter />
    </>
  );
}
