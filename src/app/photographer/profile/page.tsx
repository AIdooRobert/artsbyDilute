import Image from "next/image";
import { Building2, Save, Trash2, UserRound } from "lucide-react";
import { removeCompanyLogo, updatePhotographerProfile } from "@/app/actions/photographer";
import { PortalShell } from "@/components/portal-shell";
import { StatusMessage } from "@/components/status-message";
import { getPhotographerByUserId } from "@/lib/photographer";
import { requireRole } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function PhotographerProfile({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [user, query] = await Promise.all([requireRole("photographer"), searchParams]);
  const photographer = await getPhotographerByUserId(user.id);
  if (!photographer) return null;
  const canBrand = (photographer.pricing_plans?.sort_order ?? 0) >= 2;

  return (
    <PortalShell name={photographer.photographer_name}>
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold text-copper">{photographer.pricing_plans?.name} plan</p>
        <h1 className="display-title mt-1 text-4xl">Profile and branding</h1>
        <p className="mt-2 text-sm text-black/50">Manage the identity shown inside client galleries.</p>
        <div className="mt-7">
          <StatusMessage error={query.error} success={query.success} />
        </div>

        <form action={updatePhotographerProfile} className="grid gap-6">
          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <UserRound size={20} className="text-copper" />
              <h2 className="text-lg font-black">Account details</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                Photographer name
                <input
                  name="photographer_name"
                  className="field"
                  defaultValue={photographer.photographer_name}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Business name
                <input
                  name="business_name"
                  className="field"
                  defaultValue={photographer.business_name ?? ""}
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm font-bold">
              Account email
              <input className="field bg-black/[0.025]" value={photographer.email} disabled />
            </label>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-copper" />
                <h2 className="text-lg font-black">Client-facing brand</h2>
              </div>
              {!canBrand ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  Studio plan required
                </span>
              ) : null}
            </div>
            <div className={`mt-6 grid gap-5 ${canBrand ? "" : "pointer-events-none opacity-45"}`}>
              <label className="grid gap-2 text-sm font-bold">
                Company display name
                <input
                  name="company_name"
                  className="field"
                  defaultValue={photographer.company_name ?? ""}
                  disabled={!canBrand}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Company logo
                <input
                  name="company_logo"
                  type="file"
                  accept="image/*"
                  className="field"
                  disabled={!canBrand}
                />
              </label>
              {photographer.company_logo_url ? (
                <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-cream p-4">
                  <div className="relative size-20 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={photographer.company_logo_url}
                      alt="Company logo"
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black">Current logo</p>
                    <button
                      formAction={removeCompanyLogo}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-700"
                    >
                      <Trash2 size={14} /> Remove logo
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
          <button className="button-primary justify-self-start">
            <Save size={16} /> Save profile
          </button>
        </form>
      </div>
    </PortalShell>
  );
}
