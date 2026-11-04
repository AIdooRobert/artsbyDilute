import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getCurrentRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const [user, role, { id }] = await Promise.all([
    getCurrentUser(),
    getCurrentRole(),
    context.params,
  ]);
  if (!user || role !== "client") return new NextResponse("Unauthorized", { status: 401 });

  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("client_photos")
    .select("*, photography_clients!inner(auth_user_id)")
    .eq("id", id)
    .eq("photography_clients.auth_user_id", user.id)
    .maybeSingle();
  if (!photo) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await admin.storage
    .from("client-photos")
    .createSignedUrl(photo.storage_path, 300, { download: photo.display_name || "gallery-file" });
  if (error || !data) return new NextResponse("Unable to download file", { status: 500 });

  // Serve the original from private storage, without buffering video files in a function.
  const response = NextResponse.redirect(data.signedUrl, 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
