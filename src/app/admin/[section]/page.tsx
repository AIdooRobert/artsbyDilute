import { notFound } from "next/navigation";
import {
  createAdminUser,
  deleteAdminUser,
  messageAction,
  photographerAction,
  saveSettings,
  saveProductSettings,
  updatePaymentStatus,
} from "@/app/actions/admin";
import { AdminEntityManager } from "@/components/admin-entity-manager";
import { AdminShell } from "@/components/admin-shell";
import { StatusMessage } from "@/components/status-message";
import { adminSections } from "@/lib/admin-config";
import { getPaystackMode } from "@/lib/paystack";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [{ section: sectionKey }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("admin"),
  ]);
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.display_name ?? user.email ?? "Admin";
  const config = adminSections[sectionKey];

  if (config) {
    const { data } = await admin
      .from(config.table)
      .select("*")
      .order("created_at", { ascending: false });
    return (
      <AdminShell name={name}>
        <AdminHeading title={config.title} description={config.description} query={query} />
        <AdminEntityManager
          sectionKey={sectionKey}
          section={config}
          rows={(data as Array<Record<string, unknown>> | null) ?? []}
        />
      </AdminShell>
    );
  }

  let content: React.ReactNode;
  if (sectionKey === "messages") content = await renderMessages(admin);
  else if (sectionKey === "photographers") content = await renderPhotographers(admin);
  else if (sectionKey === "payments") content = await renderPayments(admin);
  else if (sectionKey === "settings") content = await renderSettings(admin);
  else if (sectionKey === "product-settings") content = await renderProductSettings(admin);
  else if (sectionKey === "users") content = await renderUsers(admin, user.id);
  else if (sectionKey === "activity") content = await renderActivity(admin);
  else notFound();

  return (
    <AdminShell name={name}>
      <AdminHeading
        title={sectionKey.replaceAll("-", " ")}
        description="Platform management"
        query={query}
      />
      {content}
    </AdminShell>
  );
}

function AdminHeading({
  title,
  description,
  query,
}: {
  title: string;
  description: string;
  query: { error?: string; success?: string };
}) {
  return (
    <div className="mb-7">
      <span className="eyebrow">Administration</span>
      <h1 className="display-title mt-3 text-4xl capitalize">{title}</h1>
      <p className="mt-2 text-sm text-black/48">{description}</p>
      <div className="mt-5">
        <StatusMessage error={query.error} success={query.success} />
      </div>
    </div>
  );
}

async function renderMessages(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <div className="grid gap-4">
      {(data ?? []).map((message) => (
        <article key={message.id} className={`card p-6 ${message.read_status ? "opacity-70" : ""}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div>
              <h2 className="font-black">{message.subject || "No subject"}</h2>
              <p className="mt-1 text-sm text-black/50">{message.name} · {message.email}</p>
            </div>
            <span className="text-xs text-black/38">
              {new Date(message.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/64">{message.message}</p>
          <form action={messageAction} className="mt-5 flex gap-2">
            <input type="hidden" name="id" value={message.id} />
            {!message.read_status ? (
              <button name="message_action" value="read" className="button-secondary">Mark read</button>
            ) : null}
            <button name="message_action" value="delete" className="button-danger">Delete</button>
          </form>
        </article>
      ))}
    </div>
  );
}

async function renderPhotographers(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("photographers")
    .select("*, pricing_plans(name), photography_clients(id, client_photos(id))")
    .order("created_at", { ascending: false });
  return (
    <section className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Business</th><th>Plan</th><th>Clients</th><th>Photos</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((row) => {
            const clients = row.photography_clients ?? [];
            const photoCount = clients.reduce(
              (total: number, client: { client_photos: unknown[] }) => total + (client.client_photos?.length ?? 0),
              0,
            );
            return (
              <tr key={row.id}>
                <td><strong>{row.photographer_name}</strong><br /><span className="text-xs text-black/40">{row.email}</span></td>
                <td>{row.business_name || "—"}</td>
                <td>{row.pricing_plans?.name || "—"}</td>
                <td>{clients.length}</td>
                <td>{photoCount}</td>
                <td>{row.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <form action={photographerAction} className="flex gap-2">
                    <input type="hidden" name="id" value={row.id} />
                    <button name="photographer_action" value="toggle" className="button-secondary">
                      {row.is_active ? "Disable" : "Enable"}
                    </button>
                    <button name="photographer_action" value="delete" className="button-danger">Delete</button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

async function renderPayments(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("subscriptions")
    .select("*, photographers(photographer_name, email), pricing_plans(name, currency)")
    .order("created_at", { ascending: false });
  const subscriptionIds = (data ?? []).map((row) => row.id);
  const { data: events } = subscriptionIds.length
    ? await admin
        .from("payment_events")
        .select("*")
        .in("subscription_id", subscriptionIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const latestEvent = new Map<
    string,
    {
      subscription_id: string | null;
      event_type: string;
      status: string;
    }
  >();
  for (const event of events ?? []) {
    if (event.subscription_id && !latestEvent.has(event.subscription_id)) {
      latestEvent.set(event.subscription_id, event);
    }
  }
  const paystackMode = getPaystackMode();

  return (
    <div className="grid gap-5">
      <div
        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
          paystackMode === "live"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : paystackMode === "test"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-900"
        }`}
      >
        Paystack mode: <span className="uppercase">{paystackMode}</span>
        {paystackMode === "test"
          ? ". Test transactions do not charge real money."
          : null}
      </div>
      <section className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Photographer</th><th>Plan</th><th>Amount</th><th>Reference</th><th>Status</th><th>Diagnostics</th><th>Update</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => {
              const event = latestEvent.get(row.id);
              return (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td>{row.photographers?.photographer_name}<br /><span className="text-xs text-black/40">{row.photographers?.email}</span></td>
                  <td>{row.pricing_plans?.name}</td>
                  <td>{row.pricing_plans?.currency} {row.amount}</td>
                  <td><code className="text-xs">{row.transaction_id}</code></td>
                  <td>{row.status}</td>
                  <td className="max-w-xs text-xs">
                    {row.last_error ? (
                      <span className="text-red-700">{row.last_error}</span>
                    ) : event ? (
                      <span>
                        {event.event_type}: {event.status}
                      </span>
                    ) : row.initialized_at ? (
                      <span>Initialized {new Date(row.initialized_at).toLocaleString()}</span>
                    ) : (
                      "No events"
                    )}
                  </td>
                  <td>
                    <form action={updatePaymentStatus} className="flex min-w-[280px] gap-2">
                      <input type="hidden" name="id" value={row.id} />
                      <select name="status" defaultValue={row.status} className="field">
                        {["pending", "active", "failed", "cancelled", "refunded"].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <input name="admin_notes" className="field" placeholder="Notes" />
                      <button className="button-secondary">Save</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

async function renderSettings(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.from("site_settings").select("*").order("setting_key");
  const settings = Object.fromEntries((data ?? []).map((item) => [item.setting_key, item.setting_value]));
  const fields = [
    ["site_title", "Site title"],
    ["author_name", "Author name"],
    ["author_profession", "Profession"],
    ["site_description", "Hero description"],
    ["hero_typed_items", "Specialties"],
    ["about_title", "About title"],
    ["about_description_1", "About paragraph one"],
    ["about_description_2", "About paragraph two"],
    ["author_email", "Email"],
    ["author_phone", "Phone"],
    ["location", "Location"],
    ["social_instagram", "Instagram URL"],
    ["social_github", "GitHub URL"],
    ["social_linkedin", "LinkedIn URL"],
    ["about_stat_1_value", "Primary statistic value"],
    ["about_stat_1_label", "Primary statistic label"],
    ["about_stat_2_value", "Second statistic value"],
    ["about_stat_2_label", "Second statistic label"],
    ["about_stat_3_value", "Third statistic value"],
    ["about_stat_3_label", "Third statistic label"],
  ];
  return (
    <form action={saveSettings} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
      {fields.map(([key, label]) => (
        <label key={key} className={`grid gap-2 text-sm font-bold ${key.includes("description") ? "sm:col-span-2" : ""}`}>
          {label}
          {key.includes("description") ? (
            <textarea name={key} defaultValue={settings[key] ?? ""} rows={4} className="field" />
          ) : (
            <input name={key} defaultValue={settings[key] ?? ""} className="field" />
          )}
        </label>
      ))}
      <button className="button-primary justify-self-start sm:col-span-2">Save settings</button>
    </form>
  );
}

async function renderProductSettings(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.from("product_settings").select("*").order("setting_key");
  const settings = Object.fromEntries(
    (data ?? []).map((item) => [item.setting_key, item.setting_value]),
  );
  const fields = [
    ["product_name", "Product name"],
    ["product_tagline", "Landing-page headline"],
    ["product_description", "Product description"],
    ["product_support_email", "Support email"],
  ];

  return (
    <form action={saveProductSettings} className="card grid gap-4 p-6 sm:p-8">
      {fields.map(([key, label]) => (
        <label key={key} className="grid gap-2 text-sm font-bold">
          {label}
          {key === "product_description" ? (
            <textarea
              name={key}
              defaultValue={settings[key] ?? ""}
              rows={5}
              className="field"
            />
          ) : (
            <input name={key} defaultValue={settings[key] ?? ""} className="field" />
          )}
        </label>
      ))}
      <button className="button-primary justify-self-start">Save SnapFolio settings</button>
    </form>
  );
}

async function renderUsers(admin: ReturnType<typeof createAdminClient>, currentUserId: string) {
  const { data } = await admin.from("profiles").select("*").eq("role", "admin").order("created_at");
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form action={createAdminUser} className="card grid h-fit gap-4 p-6">
        <h2 className="text-lg font-black">Create administrator</h2>
        <label className="grid gap-2 text-sm font-bold">Display name<input name="display_name" className="field" /></label>
        <label className="grid gap-2 text-sm font-bold">Email<input name="email" type="email" className="field" required /></label>
        <label className="grid gap-2 text-sm font-bold">Temporary password<input name="password" type="password" minLength={12} className="field" required /></label>
        <button className="button-primary">Create admin</button>
      </form>
      <section className="card table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Created</th><th>Action</th></tr></thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id}>
                <td>{row.display_name || row.id}</td>
                <td>{new Date(row.created_at).toLocaleDateString()}</td>
                <td>
                  {row.id === currentUserId ? "Current user" : (
                    <form action={deleteAdminUser}>
                      <input type="hidden" name="id" value={row.id} />
                      <button className="button-danger">Delete</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

async function renderActivity(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const adminIds = [...new Set((data ?? []).map((row) => row.admin_id).filter(Boolean))];
  const { data: profiles } = adminIds.length
    ? await admin.from("profiles").select("id, display_name").in("id", adminIds)
    : { data: [] };
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
  return (
    <section className="card table-wrap">
      <table className="data-table">
        <thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>
          {(data ?? []).map((row) => (
            <tr key={row.id}>
              <td>{new Date(row.created_at).toLocaleString()}</td>
              <td>{names.get(row.admin_id) || "System"}</td>
              <td>{row.action.replaceAll("_", " ")}</td>
              <td><code className="text-xs">{JSON.stringify(row.details)}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
