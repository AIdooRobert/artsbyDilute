import assert from "node:assert/strict";
import test from "node:test";
import {
  completedMediaSchema, getMediaType, isVideoPath, maxImageBytes,
  maxVideoBytes, mediaStorageName, mediaUploadSchema,
} from "../src/lib/gallery-media";

test("photos and videos enforce separate size limits and reject unsupported files", () => {
  for (const type of ["video/mp4", "video/webm", "video/quicktime"]) {
    assert.equal(mediaUploadSchema.safeParse({ name: "clip", type, size: maxVideoBytes }).success, true);
    assert.equal(mediaUploadSchema.safeParse({ name: "clip", type, size: maxVideoBytes + 1 }).success, false);
  }
  assert.equal(mediaUploadSchema.safeParse({ name: "photo.jpg", type: "image/jpeg", size: maxImageBytes }).success, true);
  assert.equal(mediaUploadSchema.safeParse({ name: "photo.jpg", type: "image/jpeg", size: maxImageBytes + 1 }).success, false);
  assert.equal(mediaUploadSchema.safeParse({ name: "bad.mp4", type: "text/html", size: 10 }).success, false);
  assert.equal(mediaUploadSchema.safeParse({ name: "empty.mp4", type: "video/mp4", size: 0 }).success, false);
});

test("missing browser MIME types are inferred without overriding explicit unsupported types", () => {
  assert.equal(getMediaType({ name: "FILM.MOV", type: "" }), "video/quicktime");
  assert.equal(getMediaType({ name: "film.mp4", type: "application/octet-stream" }), "video/mp4");
  assert.equal(getMediaType({ name: "film.mp4", type: "text/html" }), "text/html");
});

test("storage extensions follow validated media types and cannot misroute previews", () => {
  assert.equal(mediaStorageName("wrong.jpg", "video/mp4"), "wrong.mp4");
  assert.equal(mediaStorageName("wrong.mp4", "image/jpeg"), "wrong.jpg");
  assert.equal(isVideoPath("owner/gallery/clip.MOV"), true);
  assert.equal(isVideoPath("owner/gallery/clip.mp4.jpg"), false);
  assert.equal(completedMediaSchema.safeParse({ name: "clip", type: "video/mp4", size: 100, path: "owner/gallery/clip.jpg" }).success, false);
  assert.equal(completedMediaSchema.safeParse({ name: "clip", type: "video/mp4", size: 100, path: "owner/gallery/clip.mp4" }).success, true);
});
