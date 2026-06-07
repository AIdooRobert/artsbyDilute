"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getPhotographerByUserId } from "@/lib/photographer";

async function requirePhotographer() {
  const user = await requireRole("photographer");
  const photographer = await getPhotographerByUserId(user.id);
  if (!photographer) redirect("/photographer/login?error=Profile+not+found.");
  return { user, photographer };
}

const clientSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_.-]+$/),
  email: z.string().trim().email().or(z.literal("")),
  password: z.string().min(8).max(128),
});

export async function addClient(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const parsed = clientSchema.safeParse({
    clientName: formData.get("client_name"),
    username: formData.get("username"),
    email: formData.get("email") ?? "",
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/photographer/dashboard?error=Check+the+client+details.");

  const admin = createAdminClient();
  const { count } = await admin
    .from("photography_clients")
    .select("id", { count: "exact", head: true })
    .eq("photographer_id", photographer.id);

  const limit = photographer.pricing_plans?.max_galleries ?? 0;
  if ((count ?? 0) >= limit) redirect("/photographer/dashboard?error=Gallery+limit+reached.");

  const authEmail = `${parsed.data.username}@clients.snapfolio.local`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: authEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { role: "client", display_name: parsed.data.clientName },
  });
  if (authError || !authData.user) {
    redirect(`/photographer/dashboard?error=${encodeURIComponent(authError?.message ?? "Unable to create client.")}`);
  }

  const { error } = await admin.from("photography_clients").insert({
    auth_user_id: authData.user.id,
    photographer_id: photographer.id,
    username: parsed.data.username,
    client_name: parsed.data.clientName,
    email: parsed.data.email || null,
  });
  if (error) {
    await admin.auth.admin.deleteUser(authData.user.id);
    redirect(`/photographer/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/photographer/dashboard");
  redirect("/photographer/dashboard?success=Client+gallery+created.");
}

export async function resetClientPassword(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const clientId = String(formData.get("client_id") ?? "");
  const password = String(formData.get("new_password") ?? "");
  if (password.length < 8) redirect("/photographer/dashboard?error=Password+must+contain+8+characters.");

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("auth_user_id")
    .eq("id", clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();
  if (!client?.auth_user_id) redirect("/photographer/dashboard?error=Client+not+found.");

  const { error } = await admin.auth.admin.updateUserById(client.auth_user_id, { password });
  redirect(
    error
      ? `/photographer/dashboard?error=${encodeURIComponent(error.message)}`
      : "/photographer/dashboard?success=Client+password+updated.",
  );
}

export async function deleteClient(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const clientId = String(formData.get("client_id") ?? "");
  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("auth_user_id, client_photos(storage_path)")
    .eq("id", clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();
  if (!client) redirect("/photographer/dashboard?error=Client+not+found.");

  const paths = (client.client_photos ?? []).map((photo: { storage_path: string }) => photo.storage_path);
  if (paths.length) await admin.storage.from("client-photos").remove(paths);
  if (client.auth_user_id) await admin.auth.admin.deleteUser(client.auth_user_id);
  else await admin.from("photography_clients").delete().eq("id", clientId);

  revalidatePath("/photographer/dashboard");
  redirect("/photographer/dashboard?success=Client+gallery+deleted.");
}

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadClientPhotos(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const clientId = String(formData.get("client_id") ?? "");
  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) redirect("/photographer/dashboard?error=Choose+at+least+one+photo.");

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("id")
    .eq("id", clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();
  if (!client) redirect("/photographer/dashboard?error=Client+not+found.");

  const { data: existingPhotos } = await admin
    .from("client_photos")
    .select("file_size")
    .in(
      "client_id",
      (
        await admin
          .from("photography_clients")
          .select("id")
          .eq("photographer_id", photographer.id)
      ).data?.map((row) => row.id) ?? [],
    );

  const currentBytes = (existingPhotos ?? []).reduce(
    (total, photo) => total + Number(photo.file_size || 0),
    0,
  );
  const incomingBytes = files.reduce((total, file) => total + file.size, 0);
  const limitBytes = (photographer.pricing_plans?.max_storage_gb ?? 0) * 1024 * 1024 * 1024;
  if (currentBytes + incomingBytes > limitBytes) {
    redirect("/photographer/dashboard?error=Storage+limit+would+be+exceeded.");
  }

  for (const file of files) {
    if (!allowedImageTypes.has(file.type) || file.size > 20 * 1024 * 1024) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${photographer.id}/${clientId}/${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("client-photos")
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) continue;
    await admin.from("client_photos").insert({
      client_id: clientId,
      storage_path: path,
      display_name: file.name,
      file_size: file.size,
    });
  }

  revalidatePath("/photographer/dashboard");
  redirect("/photographer/dashboard?success=Photos+uploaded.");
}

export async function deletePhoto(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const photoId = String(formData.get("photo_id") ?? "");
  const admin = createAdminClient();
  const { data: photo } = await admin
    .from("client_photos")
    .select("storage_path, photography_clients!inner(photographer_id)")
    .eq("id", photoId)
    .eq("photography_clients.photographer_id", photographer.id)
    .maybeSingle();
  if (!photo) redirect("/photographer/dashboard?error=Photo+not+found.");

  await admin.storage.from("client-photos").remove([photo.storage_path]);
  await admin.from("client_photos").delete().eq("id", photoId);
  revalidatePath("/photographer/dashboard");
  redirect("/photographer/dashboard?success=Photo+deleted.");
}

export async function updatePhotographerProfile(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const name = String(formData.get("photographer_name") ?? "").trim();
  const business = String(formData.get("business_name") ?? "").trim();
  const company = String(formData.get("company_name") ?? "").trim();
  const logo = formData.get("company_logo");
  if (name.length < 2) redirect("/photographer/profile?error=Name+is+required.");

  const admin = createAdminClient();
  const updates: Record<string, string | null> = {
    photographer_name: name,
    business_name: business || null,
    company_name: company || null,
  };

  if (logo instanceof File && logo.size > 0) {
    const canBrand = (photographer.pricing_plans?.sort_order ?? 0) >= 2;
    if (!canBrand) redirect("/photographer/profile?error=Upgrade+to+use+custom+branding.");
    if (!allowedImageTypes.has(logo.type) || logo.size > 5 * 1024 * 1024) {
      redirect("/photographer/profile?error=Logo+must+be+an+image+under+5MB.");
    }
    const path = `logos/${photographer.id}/${crypto.randomUUID()}-${logo.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await admin.storage
      .from("public-media")
      .upload(path, Buffer.from(await logo.arrayBuffer()), { contentType: logo.type });
    if (!error) {
      updates.company_logo_url = admin.storage.from("public-media").getPublicUrl(path).data.publicUrl;
    }
  }

  await admin.from("photographers").update(updates).eq("id", photographer.id);
  revalidatePath("/photographer/profile");
  revalidatePath("/client/dashboard");
  redirect("/photographer/profile?success=Profile+updated.");
}

export async function removeCompanyLogo() {
  const { photographer } = await requirePhotographer();
  const admin = createAdminClient();
  await admin.from("photographers").update({ company_logo_url: null }).eq("id", photographer.id);
  revalidatePath("/photographer/profile");
  redirect("/photographer/profile?success=Logo+removed.");
}
