"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import {
  completeClientPhotoUploads,
  prepareClientPhotoUploads,
} from "@/app/actions/photographer";
import { createClient } from "@/lib/supabase/client";

import { getMediaType, mediaUploadSchema, mediaAccept, mediaRequirements, maxFilesPerUpload } from "@/lib/gallery-media";

const uploadConcurrency = 3;

type UploadStatus =
  | { type: "idle"; message: "" }
  | { type: "progress" | "success" | "error"; message: string };

export function ClientPhotoUploadForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>({ type: "idle", message: "" });
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const files = Array.from(inputRef.current?.files ?? []);

    const metadata = files.map((file) => ({ name: file.name, type: getMediaType(file), size: file.size }));

    if (!files.length) {
      setStatus({ type: "error", message: "Choose at least one photo or video." });
      return;
    }

    if (files.length > maxFilesPerUpload) {
      setStatus({
        type: "error",
        message: `Upload no more than ${maxFilesPerUpload} files at a time.`,
      });
      return;
    }

    const invalidFile = metadata.find((file) => !mediaUploadSchema.safeParse(file).success);
    if (invalidFile) {
      setStatus({
        type: "error",
        message: `${invalidFile.name}: ${mediaRequirements}`,
      });
      return;
    }

    setIsUploading(true);
    setStatus({ type: "progress", message: "Preparing upload..." });

    try {
      const prepared = await prepareClientPhotoUploads(
        clientId,
        metadata,
      );

      if (prepared.error || !prepared.uploads.length) {
        setStatus({
          type: "error",
          message: prepared.error ?? "Unable to prepare the upload.",
        });
        return;
      }

      const supabase = createClient();
      const successfulUploads: Array<{
        name: string;
        type: string;
        size: number;
        path: string;
      }> = [];
      let nextIndex = 0;
      let completedCount = 0;

      async function uploadNext() {
        while (nextIndex < prepared.uploads.length) {
          const index = nextIndex;
          nextIndex += 1;
          const upload = prepared.uploads[index];
          const file = files[index];
          const { error } = await supabase.storage
            .from("client-photos")
            .uploadToSignedUrl(upload.path, upload.token, file, {
              contentType: upload.type,
              upsert: false,
            });

          completedCount += 1;
          setStatus({
            type: "progress",
            message: `Uploading ${completedCount} of ${files.length}...`,
          });

          if (!error) {
            successfulUploads.push({
              name: upload.name,
              type: upload.type,
              size: upload.size,
              path: upload.path,
            });
          }
        }
      }

      await Promise.all(
        Array.from(
          { length: Math.min(uploadConcurrency, prepared.uploads.length) },
          () => uploadNext(),
        ),
      );

      if (!successfulUploads.length) {
        setStatus({
          type: "error",
          message: "The files could not be uploaded. Check your connection and try again.",
        });
        return;
      }

      setStatus({ type: "progress", message: "Saving gallery..." });
      const completed = await completeClientPhotoUploads(clientId, successfulUploads);
      if (completed.error) {
        setStatus({ type: "error", message: completed.error });
        return;
      }

      const failedCount = files.length - successfulUploads.length;
      setStatus({
        type: failedCount ? "error" : "success",
        message: failedCount
          ? `${completed.uploaded} files uploaded. ${failedCount} failed; select those files and try again.`
          : `${completed.uploaded} files uploaded successfully.`,
      });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      console.error("Client photo upload failed", error);
      setStatus({
        type: "error",
        message: "The upload was interrupted. Check your connection and try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end"
    >
      <label className="grid gap-2 text-sm font-bold">
        Add photos or videos
        <input
          ref={inputRef}
          name="files"
          type="file"
          accept={mediaAccept}
          multiple
          className="field file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1 file:text-xs file:font-bold"
          required
          disabled={isUploading}
        />
      </label>
      <button
        type="submit"
        className="button-primary disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isUploading}
      >
        <Upload size={16} />
        {isUploading ? "Uploading..." : "Upload selection"}
      </button>
      <p className="text-xs text-black/50 sm:col-span-2">{mediaRequirements} Videos count toward your plan storage.</p>
      {status.type !== "idle" ? (
        <div
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm font-semibold sm:col-span-2 ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-black/10 bg-cream text-black/65"
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </form>
  );
}
