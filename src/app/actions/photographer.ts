"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
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

export async function prepareClientAccess(
  clientId: string,
  password: string,
) {
  const { photographer } = await requirePhotographer();
  const parsed = z
    .object({
      clientId: z.string().uuid(),
      password: z.string().min(8).max(128),
    })
    .safeParse({ clientId, password });

  if (!parsed.success) {
    return { error: "Password must contain at least 8 characters." };
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("auth_user_id")
    .eq("id", parsed.data.clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();
  if (!client?.auth_user_id) return { error: "Client gallery not found." };

  const { error } = await admin.auth.admin.updateUserById(client.auth_user_id, {
    password: parsed.data.password,
  });
  if (error) {
    console.error("Unable to prepare client access", error);
    return { error: "Unable to update the client password. Please try again." };
  }

  revalidatePath("/photographer/dashboard");
  revalidatePath(`/photographer/clients/${parsed.data.clientId}`);
  return { error: null };
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

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const allowedImageTypeSet = new Set<string>(allowedImageTypes);
const maxPhotoSize = 20 * 1024 * 1024;
const maxPhotosPerUpload = 50;

const photoUploadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(allowedImageTypes),
  size: z.number().int().positive().max(maxPhotoSize),
});

const preparedPhotoUploadSchema = photoUploadSchema.extend({
  path: z.string().min(1).max(1024),
});

async function getPhotographerStorageBytes(
  admin: ReturnType<typeof createAdminClient>,
  photographerId: string,
) {
  const { data: clients, error: clientError } = await admin
    .from("photography_clients")
    .select("id")
    .eq("photographer_id", photographerId);
  if (clientError) throw clientError;

  const clientIds = (clients ?? []).map((client) => client.id);
  if (!clientIds.length) return 0;

  const { data: photos, error: photoError } = await admin
    .from("client_photos")
    .select("file_size")
    .in("client_id", clientIds);
  if (photoError) throw photoError;

  return (photos ?? []).reduce(
    (total, photo) => total + Number(photo.file_size || 0),
    0,
  );
}

export async function prepareClientPhotoUploads(
  clientId: string,
  fileMetadata: Array<{ name: string; type: string; size: number }>,
) {
  const { photographer } = await requirePhotographer();
  const parsedFiles = z
    .array(photoUploadSchema)
    .min(1)
    .max(maxPhotosPerUpload)
    .safeParse(fileMetadata);

  if (!parsedFiles.success) {
    return {
      error: `Choose 1-${maxPhotosPerUpload} JPEG, PNG, WebP, or GIF images under 20MB each.`,
      uploads: [],
    };
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("id")
    .eq("id", clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();

  if (!client) return { error: "Client gallery not found.", uploads: [] };

  try {
    const currentBytes = await getPhotographerStorageBytes(admin, photographer.id);
    const incomingBytes = parsedFiles.data.reduce((total, file) => total + file.size, 0);
    const limitBytes =
      (photographer.pricing_plans?.max_storage_gb ?? 0) * 1024 * 1024 * 1024;

    if (currentBytes + incomingBytes > limitBytes) {
      return { error: "This upload would exceed your plan storage limit.", uploads: [] };
    }

    const uploads = await Promise.all(
      parsedFiles.data.map(async (file) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${photographer.id}/${clientId}/${crypto.randomUUID()}-${safeName}`;
        const { data, error } = await admin.storage
          .from("client-photos")
          .createSignedUploadUrl(path);

        if (error || !data) throw error ?? new Error("Unable to prepare photo upload.");

        return {
          ...file,
          path,
          token: data.token,
        };
      }),
    );

    return { error: null, uploads };
  } catch (error) {
    console.error("Unable to prepare client photo uploads", error);
    return { error: "Unable to prepare the upload. Please try again.", uploads: [] };
  }
}

export async function completeClientPhotoUploads(
  clientId: string,
  uploadedPhotos: Array<{ name: string; type: string; size: number; path: string }>,
) {
  const { photographer } = await requirePhotographer();
  const parsedPhotos = z
    .array(preparedPhotoUploadSchema)
    .min(1)
    .max(maxPhotosPerUpload)
    .safeParse(uploadedPhotos);

  if (!parsedPhotos.success) {
    return { error: "The uploaded photo details were invalid.", uploaded: 0 };
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("photography_clients")
    .select("id")
    .eq("id", clientId)
    .eq("photographer_id", photographer.id)
    .maybeSingle();

  if (!client) return { error: "Client gallery not found.", uploaded: 0 };

  const pathPrefix = `${photographer.id}/${clientId}/`;
  if (parsedPhotos.data.some((photo) => !photo.path.startsWith(pathPrefix))) {
    return { error: "One or more upload paths were invalid.", uploaded: 0 };
  }

  const paths = parsedPhotos.data.map((photo) => photo.path);
  let newPhotos: typeof parsedPhotos.data = [];
  let photosRegistered = false;

  try {
    const { data: existingPhotos, error: existingError } = await admin
      .from("client_photos")
      .select("storage_path")
      .in("storage_path", paths);
    if (existingError) throw existingError;

    const existingPaths = new Set(
      (existingPhotos ?? []).map((photo) => photo.storage_path),
    );
    newPhotos = parsedPhotos.data.filter(
      (photo) => !existingPaths.has(photo.path),
    );
    if (!newPhotos.length) {
      return { error: null, uploaded: parsedPhotos.data.length };
    }

    const verifiedPhotos = await Promise.all(
      newPhotos.map(async (photo) => {
        const { data, error } = await admin.storage
          .from("client-photos")
          .info(photo.path);
        if (
          error ||
          !data ||
          data.size !== photo.size ||
          data.contentType !== photo.type ||
          !allowedImageTypeSet.has(data.contentType)
        ) {
          return null;
        }
        return photo;
      }),
    );

    if (verifiedPhotos.some((photo) => !photo)) {
      await admin.storage.from("client-photos").remove(newPhotos.map((photo) => photo.path));
      return {
        error: "One or more photos could not be verified. Please select them and try again.",
        uploaded: 0,
      };
    }

    const currentBytes = await getPhotographerStorageBytes(admin, photographer.id);
    const incomingBytes = newPhotos.reduce((total, photo) => total + photo.size, 0);
    const limitBytes =
      (photographer.pricing_plans?.max_storage_gb ?? 0) * 1024 * 1024 * 1024;

    if (currentBytes + incomingBytes > limitBytes) {
      await admin.storage.from("client-photos").remove(newPhotos.map((photo) => photo.path));
      return { error: "This upload would exceed your plan storage limit.", uploaded: 0 };
    }

    const { error: insertError } = await admin.from("client_photos").insert(
      newPhotos.map((photo) => ({
        client_id: clientId,
        storage_path: photo.path,
        display_name: photo.name,
        file_size: photo.size,
      })),
    );

    if (insertError) {
      throw insertError;
    }

    photosRegistered = true;
    revalidatePath("/photographer/dashboard");
    revalidatePath(`/photographer/clients/${clientId}`);
    return { error: null, uploaded: parsedPhotos.data.length };
  } catch (error) {
    if (newPhotos.length && !photosRegistered) {
      await admin.storage.from("client-photos").remove(newPhotos.map((photo) => photo.path));
    }
    console.error("Unable to complete client photo uploads", error);
    return { error: "Unable to save the uploaded photos. Please try again.", uploaded: 0 };
  }
}

export async function deletePhoto(formData: FormData) {
  const { photographer } = await requirePhotographer();
  const parsed = z.object({ photoId: z.uuid(), clientId: z.uuid() }).safeParse({
    photoId: formData.get("photo_id"),
    clientId: formData.get("client_id"),
  });
  if (!parsed.success) redirect("/photographer/dashboard?error=Invalid+photo+details.");

  const { photoId, clientId } = parsed.data;
  const galleryPath = `/photographer/clients/${clientId}`;
  const admin = createAdminClient();
  let errorMessage: string | null = null;
  try {
    const { data: client, error: clientError } = await admin
      .from("photography_clients")
      .select("id")
      .eq("id", clientId)
      .eq("photographer_id", photographer.id)
      .maybeSingle();
    if (clientError) throw clientError;
    if (!client) redirect("/photographer/dashboard?error=Client+gallery+not+found.");

    const { data: photo, error: photoError } = await admin
      .from("client_photos")
      .select("storage_path")
      .eq("id", photoId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (photoError) throw photoError;

    if (photo) {
      const { error: storageError } = await admin.storage
        .from("client-photos")
        .remove([photo.storage_path]);
      if (storageError) throw storageError;

      const { error: deleteError } = await admin
        .from("client_photos")
        .delete()
        .eq("id", photoId)
        .eq("client_id", clientId);
      if (deleteError) throw deleteError;
    } else {
      errorMessage = "Photo not found. It may already have been deleted.";
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to delete client photo", error);
    errorMessage = "Unable to delete the photo. Please try again.";
  }

  revalidatePath(galleryPath);
  revalidatePath("/photographer/dashboard");
  revalidatePath("/client/dashboard");
  redirect(errorMessage
    ? `${galleryPath}?error=${encodeURIComponent(errorMessage)}`
    : `${galleryPath}?success=Photo+deleted.`);
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
    if (!allowedImageTypeSet.has(logo.type) || logo.size > 5 * 1024 * 1024) {
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
