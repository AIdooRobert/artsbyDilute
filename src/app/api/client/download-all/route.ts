import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentUser, getCurrentRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const [user, role] = await Promise.all([getCurrentUser(), getCurrentRole()]);
  if (!user || role !== "client") return new NextResponse("Unauthorized", { status: 401 });

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("id, client_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!client) return new NextResponse("Gallery not found", { status: 404 });

  const { data: photos } = await admin
    .from("client_photos")
    .select("*")
    .eq("client_id", client.id);

  const zip = new JSZip();
  for (const photo of photos ?? []) {
    const { data } = await admin.storage.from("client-photos").download(photo.storage_path);
    if (data) zip.file(photo.display_name || `${photo.id}.jpg`, await data.arrayBuffer());
  }
  const content = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  const responseBody = content.buffer.slice(
    content.byteOffset,
    content.byteOffset + content.byteLength,
  ) as ArrayBuffer;
  const safeName = client.client_name.replace(/[^a-zA-Z0-9_-]/g, "-");

  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}-photos.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
