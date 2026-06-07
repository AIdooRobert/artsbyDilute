import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import { notFound } from "next/navigation";
import { deletePhoto, uploadClientPhotos } from "@/app/actions/photographer";
import { PortalShell } from "@/components/portal-shell";
import { StatusMessage } from "@/components/status-message";
import { getPhotographerByUserId } from "@/lib/photographer";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { ClientPhoto } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ManageClientGallery({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireRole("photographer")]);
  const photographer = await getPhotographerByUserId(user.id);
  if (!photographer) notFound();

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("*")
    .eq("id", id)
    .eq("photographer_id", photographer.id)
    .maybeSingle();
  if (!client) notFound();

  const { data: photos } = await admin
    .from("client_photos")
    .select("*")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });

  const photoList = await Promise.all(
    ((photos as ClientPhoto[] | null) ?? []).map(async (photo) => ({
      ...photo,
      signed_url: (
        await admin.storage.from("client-photos").createSignedUrl(photo.storage_path, 1800)
      ).data?.signedUrl,
    })),
  );

  return (
    <PortalShell name={photographer.photographer_name}>
      <div className="mx-auto max-w-7xl">
        <Link href="/photographer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-copper">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display-title text-4xl">{client.client_name}</h1>
            <p className="mt-2 text-sm text-black/48">@{client.username} · {photoList.length} photos</p>
          </div>
        </div>
        <div className="mt-6">
          <StatusMessage error={query.error} success={query.success} />
        </div>

        <form
          action={uploadClientPhotos}
          className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <input type="hidden" name="client_id" value={client.id} />
          <label className="grid gap-2 text-sm font-bold">
            Add photos
            <input
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="field file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1 file:text-xs file:font-bold"
              required
            />
          </label>
          <button className="button-primary">
            <Upload size={16} /> Upload selection
          </button>
        </form>

        {photoList.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photoList.map((photo) => (
              <article key={photo.id} className="card overflow-hidden">
                <div className="relative aspect-square bg-black/5">
                  {photo.signed_url ? (
                    <Image
                      src={photo.signed_url}
                      alt={photo.display_name ?? "Client photo"}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="min-w-0 truncate text-xs font-bold">{photo.display_name}</p>
                  <form action={deletePhoto}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button
                      className="grid size-9 place-items-center rounded-full bg-red-50 text-red-700"
                      aria-label="Delete photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-14 text-center text-sm text-black/45">
            This gallery is empty. Upload the first photographs above.
          </div>
        )}
      </div>
    </PortalShell>
  );
}
