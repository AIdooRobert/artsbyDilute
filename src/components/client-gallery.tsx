"use client";

import Image from "next/image";
import { Download, Maximize2, X } from "lucide-react";
import { useState } from "react";
import type { ClientPhoto } from "@/lib/types";

export function ClientGallery({ photos }: { photos: ClientPhoto[] }) {
  const [active, setActive] = useState<ClientPhoto | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <article key={photo.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm">
            <button
              type="button"
              className="relative block aspect-[4/3] w-full overflow-hidden bg-black/5"
              onClick={() => setActive(photo)}
            >
              {photo.signed_url ? (
                <Image
                  src={photo.signed_url}
                  alt={photo.display_name ?? "Gallery photo"}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover duration-500 group-hover:scale-[1.03]"
                />
              ) : null}
              <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur group-hover:opacity-100">
                <Maximize2 size={16} />
              </span>
            </button>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{photo.display_name}</p>
                <p className="mt-1 text-xs text-black/40">
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                    new Date(photo.uploaded_at),
                  )}
                </p>
              </div>
              <a
                href={`/api/client/photos/${photo.id}/download`}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-copper"
                aria-label={`Download ${photo.display_name}`}
              >
                <Download size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4">
          <button
            type="button"
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white"
            onClick={() => setActive(null)}
            aria-label="Close photo"
          >
            <X size={22} />
          </button>
          <div className="relative h-[82vh] w-[94vw]">
            {active.signed_url ? (
              <Image
                src={active.signed_url}
                alt={active.display_name ?? "Gallery photo"}
                fill
                sizes="94vw"
                className="object-contain"
                priority
              />
            ) : null}
          </div>
          <a
            href={`/api/client/photos/${active.id}/download`}
            className="button-secondary absolute bottom-5"
          >
            <Download size={16} /> Download original
          </a>
        </div>
      ) : null}
    </>
  );
}
