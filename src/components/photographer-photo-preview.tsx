"use client";

import Image from "next/image";
import { GalleryVideo } from "@/components/gallery-video";
import { Maximize2, X } from "lucide-react";
import { useRef } from "react";

export function PhotographerPhotoPreview({
  src,
  name,
  video = false,
}: {
  src?: string;
  name: string;
  video?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (!src) {
    return (
      <div className="grid aspect-square place-items-center bg-black/5 p-4 text-sm text-black/50">
        Preview unavailable. Refresh the gallery to try again.
      </div>
    );
  }

  if (video) return <div className="aspect-square overflow-hidden"><GalleryVideo src={src} name={name} /></div>;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-black/5 focus-visible:outline-2 focus-visible:outline-copper"
        aria-label={`View ${name} full size`}
      >
        <Image unoptimized
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-cover"
        />
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white">
          <Maximize2 size={17} aria-hidden="true" />
        </span>
      </button>
      <dialog
        ref={dialogRef}
        aria-label={`Photo preview: ${name}`}
        className="fixed inset-0 m-auto h-[92dvh] max-h-none w-[96vw] max-w-none overflow-hidden rounded-xl bg-black text-white backdrop:bg-black/85"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between gap-4 p-3">
            <p className="truncate text-sm">{name}</p>
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25"
              aria-label="Close photo preview"
            >
              <X size={22} />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image unoptimized src={src} alt={name} fill sizes="96vw" className="object-contain" />
          </div>
        </div>
      </dialog>
    </>
  );
}
