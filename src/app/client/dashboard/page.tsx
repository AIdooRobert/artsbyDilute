import Image from "next/image";
import { Camera, Download, ImageIcon, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ClientGallery } from "@/components/client-gallery";
import { getClientGallery } from "@/lib/photographer";
import { requireRole } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your gallery" };

export default async function ClientDashboard() {
  const user = await requireRole("client");
  const gallery = await getClientGallery(user.id);
  if (!gallery) return null;

  const photographer = gallery.client.photographers as {
    photographer_name: string;
    business_name: string | null;
    company_name: string | null;
    company_logo_url: string | null;
  };
  const brandName =
    photographer.company_name || photographer.business_name || photographer.photographer_name;

  return (
    <main className="min-h-screen bg-[#f4f2ed]">
      <header className="border-b border-black/8 bg-white">
        <div className="container-shell flex min-h-18 items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {photographer.company_logo_url ? (
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={photographer.company_logo_url}
                  alt={brandName}
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </span>
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white">
                <Camera size={19} />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-black">{brandName}</p>
              <p className="text-xs text-black/42">Private client gallery</p>
            </div>
          </div>
          <form action={logout}>
            <button className="button-secondary">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="container-shell py-10 sm:py-14">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Delivered for you</span>
            <h1 className="display-title mt-4 text-4xl sm:text-5xl">
              {gallery.client.client_name}&apos;s gallery
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-black/48">
              <ImageIcon size={16} /> {gallery.photos.length}{" "}
              {gallery.photos.length === 1 ? "photograph" : "photographs"}
            </p>
          </div>
          {gallery.photos.length ? (
            <a href="/api/client/download-all" className="button-primary">
              <Download size={16} /> Download all as ZIP
            </a>
          ) : null}
        </section>

        <section className="mt-9">
          {gallery.photos.length ? (
            <ClientGallery photos={gallery.photos} />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white p-16 text-center">
              <ImageIcon className="mx-auto text-copper" size={32} />
              <h2 className="display-title mt-4 text-2xl">Your gallery is being prepared.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/48">
                There are no photographs here yet. Your photographer will add them as
                soon as the final set is ready.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
