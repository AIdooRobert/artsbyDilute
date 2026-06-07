"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminSections } from "@/lib/admin-config";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

async function getAdmin() {
  const user = await requireRole("admin");
  return { user, supabase: createAdminClient() };
}

async function logAdminAction(
  adminId: string,
  action: string,
  details: Record<string, unknown>,
) {
  const supabase = createAdminClient();
  await supabase.from("admin_activity_logs").insert({
    admin_id: adminId,
    action,
    details,
  });
}

export async function saveAdminEntity(sectionKey: string, formData: FormData) {
  const section = adminSections[sectionKey];
  if (!section) redirect("/admin");
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  const payload: Record<string, unknown> = {};

  for (const field of section.fields) {
    if (field.type === "file") {
      const file = formData.get(field.name);
      if (file instanceof File && file.size > 0 && field.imageColumn) {
        if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
          redirect(`/admin/${sectionKey}?error=Image+must+be+under+10MB.`);
        }
        const path = `${section.table}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error } = await supabase.storage
          .from("public-media")
          .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
        if (!error) {
          payload[field.imageColumn] = supabase.storage.from("public-media").getPublicUrl(path)
            .data.publicUrl;
        }
      }
      continue;
    }

    if (field.type === "checkbox") {
      payload[field.name] = formData.get(field.name) === "on";
    } else if (field.type === "number") {
      payload[field.name] = Number(formData.get(field.name) ?? 0);
    } else if (field.type === "list") {
      payload[field.name] = String(formData.get(field.name) ?? "")
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean);
    } else {
      payload[field.name] = String(formData.get(field.name) ?? "").trim() || null;
    }
  }

  if (section.table === "pricing_plans") payload.price_max = payload.price_min;

  const query = id
    ? supabase.from(section.table).update(payload).eq("id", id)
    : supabase.from(section.table).insert(payload);
  const { error } = await query;
  if (error) redirect(`/admin/${sectionKey}?error=${encodeURIComponent(error.message)}`);

  await logAdminAction(user.id, id ? `update_${section.table}` : `create_${section.table}`, {
    id: id || undefined,
  });
  revalidatePath(`/admin/${sectionKey}`);
  revalidatePath("/");
  redirect(`/admin/${sectionKey}?success=Saved+successfully.`);
}

export async function deleteAdminEntity(sectionKey: string, formData: FormData) {
  const section = adminSections[sectionKey];
  if (!section) redirect("/admin");
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from(section.table).delete().eq("id", id);
  if (error) redirect(`/admin/${sectionKey}?error=${encodeURIComponent(error.message)}`);

  await logAdminAction(user.id, `delete_${section.table}`, { id });
  revalidatePath(`/admin/${sectionKey}`);
  revalidatePath("/");
  redirect(`/admin/${sectionKey}?success=Deleted+successfully.`);
}

export async function saveSettings(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const reserved = new Set(["$ACTION_ID"]);
  const entries = Array.from(formData.entries())
    .filter(([key]) => !reserved.has(key))
    .map(([setting_key, value]) => ({
      setting_key,
      setting_value: String(value),
      updated_at: new Date().toISOString(),
    }));

  const { error } = await supabase.from("site_settings").upsert(entries, {
    onConflict: "setting_key",
  });
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  await logAdminAction(user.id, "update_site_settings", { keys: entries.map((item) => item.setting_key) });
  revalidatePath("/");
  redirect("/admin/settings?success=Settings+updated.");
}

export async function saveProductSettings(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const entries = Array.from(formData.entries())
    .filter(([key]) => key !== "$ACTION_ID")
    .map(([setting_key, value]) => ({
      setting_key,
      setting_value: String(value),
      updated_at: new Date().toISOString(),
    }));

  const { error } = await supabase.from("product_settings").upsert(entries, {
    onConflict: "setting_key",
  });
  if (error) redirect(`/admin/product-settings?error=${encodeURIComponent(error.message)}`);
  await logAdminAction(user.id, "update_product_settings", {
    keys: entries.map((item) => item.setting_key),
  });
  revalidatePath("/snapfolio");
  redirect("/admin/product-settings?success=SnapFolio+settings+updated.");
}

export async function messageAction(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("message_action") ?? "");
  if (action === "delete") await supabase.from("contact_messages").delete().eq("id", id);
  else await supabase.from("contact_messages").update({ read_status: true }).eq("id", id);
  await logAdminAction(user.id, `${action}_message`, { id });
  revalidatePath("/admin/messages");
}

export async function photographerAction(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("photographer_action") ?? "");
  const { data: photographer } = await supabase
    .from("photographers")
    .select("auth_user_id, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!photographer) redirect("/admin/photographers?error=Photographer+not+found.");

  if (action === "delete") {
    await supabase.auth.admin.deleteUser(photographer.auth_user_id);
  } else {
    await supabase
      .from("photographers")
      .update({ is_active: !photographer.is_active })
      .eq("id", id);
  }
  await logAdminAction(user.id, `${action}_photographer`, { id });
  revalidatePath("/admin/photographers");
}

export async function updatePaymentStatus(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "active", "failed", "cancelled", "refunded"].includes(status)) {
    redirect("/admin/payments?error=Invalid+status.");
  }
  await supabase
    .from("subscriptions")
    .update({
      status,
      metadata: { admin_notes: String(formData.get("admin_notes") ?? "") },
    })
    .eq("id", id);
  await logAdminAction(user.id, "update_payment", { id, status });
  revalidatePath("/admin/payments");
}

export async function createAdminUser(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!email || password.length < 8) redirect("/admin/users?error=Enter+a+valid+email+and+password.");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", display_name: displayName || email },
  });
  if (error || !data.user) redirect(`/admin/users?error=${encodeURIComponent(error?.message ?? "Unable to create admin.")}`);
  await supabase.from("profiles").update({ role: "admin", display_name: displayName || email }).eq("id", data.user.id);
  await logAdminAction(user.id, "create_admin", { created_user_id: data.user.id });
  revalidatePath("/admin/users");
  redirect("/admin/users?success=Admin+created.");
}

export async function deleteAdminUser(formData: FormData) {
  const { user, supabase } = await getAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === user.id) redirect("/admin/users?error=You+cannot+delete+your+own+account.");
  await supabase.auth.admin.deleteUser(id);
  await logAdminAction(user.id, "delete_admin", { deleted_user_id: id });
  revalidatePath("/admin/users");
}
