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

  const { data, error } = await admin.storage.from("client-photos").download(photo.storage_path);
  if (error || !data) return new NextResponse("Unable to download photo", { status: 500 });

  return new NextResponse(data.stream(), {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(photo.display_name || "photo")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
