import { z } from "zod";

export const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const videoTypes = ["video/mp4", "video/webm", "video/quicktime"] as const;
export const mediaTypes = [...imageTypes, ...videoTypes] as const;
export const maxImageBytes = 20 * 1024 * 1024;
export const maxVideoBytes = 50 * 1024 * 1024;
export const maxFilesPerUpload = 50;
export const mediaAccept = [...mediaTypes, ".mp4", ".webm", ".mov"].join(",");
export const mediaRequirements = "JPEG, PNG, WebP or GIF up to 20 MB; MP4, WebM or MOV up to 50 MB.";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
};

export function isVideoPath(path: string) {
  return /\.(mp4|webm|mov)$/i.test(path);
}

export function getMediaType(file: { name: string; type: string }) {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpeg") return "image/jpeg";
  return Object.entries(extensions).find(([, value]) => value === extension)?.[0] ?? "";
}

// Use the verified MIME type for the stored extension, so previews and ZIP filtering agree.
export function mediaStorageName(name: string, type: string) {
  const stem = name.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9._-]/g, "-") || "file";
  return `${stem}.${extensions[type]}`;
}

export const mediaUploadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(mediaTypes),
  size: z.number().int().positive(),
}).refine(
  (file) => file.size <= (file.type.startsWith("video/") ? maxVideoBytes : maxImageBytes),
  { message: mediaRequirements },
);

export const completedMediaSchema = mediaUploadSchema.safeExtend({
  path: z.string().min(1).max(1024),
}).refine(
  (file) => file.path.endsWith(`.${extensions[file.type]}`),
  { message: "The stored file type does not match its upload metadata." },
);
