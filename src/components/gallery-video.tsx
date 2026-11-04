"use client";

import { useState } from "react";

export function GalleryVideo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-full w-full flex-col justify-center bg-black text-white">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        aria-label={name}
        className="max-h-full min-h-0 w-full object-contain"
        onError={() => setFailed(true)}
      />
      {failed ? (
        <p role="status" className="p-3 text-center text-xs">
          This video cannot be played here. Download it to watch on your device, or refresh the gallery and try again.
        </p>
      ) : null}
    </div>
  );
}
