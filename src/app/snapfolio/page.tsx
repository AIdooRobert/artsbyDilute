import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CloudUpload,
  Download,
  ImageIcon,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PricingCard } from "@/components/pricing-card";
import { ProductFooter } from "@/components/product-footer";
import { ProductHeader } from "@/components/product-header";
import { SectionHeading } from "@/components/section-heading";
import { getPricingPlans, getProductSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: { absolute: "SnapFolio Photography Management" },
  description: "Private client galleries and photography studio management.",
};

const features = [
  {
    icon: Users,
    title: "Client galleries",
    copy: "Create private galleries with individual client credentials in seconds.",
  },
  {
    icon: CloudUpload,
    title: "Simple delivery",
    copy: "Upload final images, organize each gallery, and keep delivery in one place.",
  },
  {
    icon: Download,
    title: "Easy downloads",
    copy: "Clients can view fullscreen, download individual files, or retrieve the complete gallery.",
  },
  {
    icon: Palette,
    title: "Studio branding",
    copy: "Present your own company name and logo on supported plans.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    copy: "Supabase Auth, private storage, and row-level policies protect every gallery.",
  },
  {
    icon: BarChart3,
    title: "Usage visibility",
    copy: "Track gallery and storage limits before they interrupt your workflow.",
  },
];

export default async function SnapFolioLanding() {
  const [settings, plans] = await Promise.all([getProductSettings(), getPricingPlans()]);

  return (
    <>
      <ProductHeader />
      <main className="bg-ink text-white">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute -right-24 -top-24 size-[520px] rounded-full bg-copper/15 blur-3xl" />
          <div className="container-shell relative grid items-center gap-14 lg:grid-cols-[1fr_.9fr]">
            <div>
              <span className="inline-flex rounded-full border border-copper/30 bg-copper/10 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-copper">
                Photography client management
              </span>
              <h1 className="display-title mt-7 text-5xl leading-[.98] sm:text-6xl lg:text-7xl">
                {settings.product_tagline}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/60 sm:text-lg">
                {settings.product_description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/pricing" className="rounded-full bg-copper px-5 py-3 text-sm font-black text-white hover:bg-white hover:text-ink">
                  Choose a plan <ArrowRight size={17} className="ml-2 inline" />
                </Link>
                <Link href="/photographer/login" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black hover:bg-white hover:text-ink">
                  Photographer login
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-5 text-sm text-white/50">
                <span className="flex items-center gap-2"><Check size={15} className="text-copper" /> Mobile friendly</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-copper" /> Paystack billing</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-copper" /> Secure downloads</span>
              </div>
            </div>
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[.05] p-5 shadow-2xl">
              <div className="rounded-[1.4rem] bg-[#f7f3ea] p-5 text-ink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.12em] text-copper">Studio dashboard</p>
                    <h2 className="mt-1 text-xl font-black">Good morning, Ama.</h2>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-ink text-white"><ImageIcon size={20} /></span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["12", "Galleries"],
                    ["486", "Photos"],
                    ["8.4 GB", "Storage"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl bg-white p-4">
                      <strong className="block text-lg">{value}</strong>
                      <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/38">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  {["Adwoa and Kwame", "Acme Brand Campaign", "Family Portraits"].map((name, index) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-white p-4">
                      <div>
                        <p className="text-sm font-black">{name}</p>
                        <p className="mt-1 text-xs text-black/42">{[84, 42, 120][index]} photos</p>
                      </div>
                      <ArrowRight size={16} className="text-copper" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20 text-ink sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Everything you need"
              title="A calmer way to deliver photography."
              copy="SnapFolio replaces scattered links, folders, passwords, and follow-up messages with one organized workflow."
              center
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="card p-7">
                    <span className="grid size-12 place-items-center rounded-full bg-cream text-copper"><Icon size={22} /></span>
                    <h3 className="display-title mt-6 text-2xl">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/55">{feature.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-cream py-20 text-ink sm:py-28">
          <div className="container-shell">
            <SectionHeading eyebrow="How it works" title="From final edit to client download in four steps." center />
            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {[
                ["01", "Create client", "Add the client and choose their private login."],
                ["02", "Upload photos", "Add the final images to the correct gallery."],
                ["03", "Share access", "Send the client their portal username and password."],
                ["04", "Client downloads", "They view, download favorites, or get the complete ZIP."],
              ].map(([number, title, copy]) => (
                <article key={number} className="relative rounded-[1.4rem] bg-white p-6">
                  <span className="display-title text-4xl text-copper/35">{number}</span>
                  <h3 className="mt-5 font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/52">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-20 text-ink sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Plans"
              title="Start small and grow with your studio."
              copy="Every plan includes secure client galleries and full-resolution delivery."
              center
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {plans.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="container-shell rounded-[2rem] border border-white/10 bg-white/[.05] p-8 text-center sm:p-14">
            <LockKeyhole className="mx-auto text-copper" size={30} />
            <h2 className="display-title mx-auto mt-6 max-w-3xl text-4xl">
              Give clients a delivery experience that matches the quality of your work.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/pricing" className="rounded-full bg-copper px-5 py-3 text-sm font-black">Get started</Link>
              <Link href="/client/login" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black">Open client portal</Link>
            </div>
          </div>
        </section>
      </main>
      <ProductFooter />
    </>
  );
}
