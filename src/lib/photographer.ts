import { createAdminClient, createClient } from "@/lib/supabase/server";
import type {
  ClientPhoto,
  Photographer,
  PhotographyClient,
  PricingPlan,
} from "@/lib/types";

export async function getPhotographerByUserId(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photographers")
    .select("*, pricing_plans(*)")
    .eq("auth_user_id", userId)
    .maybeSingle();
  return data as (Photographer & { pricing_plans: PricingPlan | null }) | null;
}

export async function getPhotographerDashboard(userId: string) {
  const photographer = await getPhotographerByUserId(userId);
  if (!photographer) return null;

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("photography_clients")
    .select("*, client_photos(id, file_size)")
    .eq("photographer_id", photographer.id)
    .order("created_at", { ascending: false });

  const normalizedClients = (clients ?? []).map((client) => ({
    ...client,
    photo_count: client.client_photos?.length ?? 0,
    storage_bytes: (client.client_photos ?? []).reduce(
      (total: number, photo: { file_size: number }) => total + Number(photo.file_size || 0),
      0,
    ),
  })) as Array<PhotographyClient & { photo_count: number; storage_bytes: number }>;

  const storageBytes = normalizedClients.reduce(
    (total, client) => total + client.storage_bytes,
    0,
  );

  return {
    photographer,
    clients: normalizedClients,
    usage: {
      galleries: normalizedClients.length,
      storageBytes,
      storageGb: storageBytes / 1024 / 1024 / 1024,
    },
  };
}

export async function getClientGallery(userId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("photography_clients")
    .select("*, photographers(photographer_name, business_name, company_name, company_logo_url)")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!client) return null;

  const { data: photos } = await supabase
    .from("client_photos")
    .select("*")
    .eq("client_id", client.id)
    .order("uploaded_at", { ascending: false });

  const admin = createAdminClient();
  const withUrls = await Promise.all(
    ((photos as ClientPhoto[] | null) ?? []).map(async (photo) => {
      const { data } = await admin.storage
        .from("client-photos")
        .createSignedUrl(photo.storage_path, 60 * 30);
      return { ...photo, signed_url: data?.signedUrl };
    }),
  );

  return { client, photos: withUrls };
}
