import Link from "next/link";
import {
  ArrowUpRight,
  FolderOpen,
  HardDrive,
  ImageIcon,
  Plus,
  UserRound,
} from "lucide-react";
import { addClient, deleteClient, resetClientPassword } from "@/app/actions/photographer";
import { PortalShell } from "@/components/portal-shell";
import { StatusMessage } from "@/components/status-message";
import { getPhotographerDashboard } from "@/lib/photographer";
import { requireRole } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Photographer dashboard" };

export default async function PhotographerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; payment?: string }>;
}) {
  const [user, query] = await Promise.all([requireRole("photographer"), searchParams]);
  const dashboard = await getPhotographerDashboard(user.id);
  if (!dashboard) return null;

  const { photographer, clients, subscriptions, usage } = dashboard;
  const plan = photographer.pricing_plans;
  const galleryPercent = Math.min(100, (usage.galleries / Math.max(plan?.max_galleries ?? 1, 1)) * 100);
  const storagePercent = Math.min(100, (usage.storageGb / Math.max(plan?.max_storage_gb ?? 1, 1)) * 100);

  return (
    <PortalShell name={photographer.photographer_name}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-copper">{plan?.name ?? "Pending"} plan</p>
            <h1 className="display-title mt-1 text-4xl">Good to see you, {photographer.photographer_name}.</h1>
            <p className="mt-2 text-sm text-black/50">Manage private galleries and client access.</p>
          </div>
          <Link href="/photographer/upgrade" className="button-primary">
            Upgrade plan <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-7">
          <StatusMessage
            error={query.error}
            success={query.success ?? (query.payment === "success" ? "Payment verified and plan activated." : undefined)}
          />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Client galleries", value: usage.galleries, icon: FolderOpen },
            {
              label: "Total photos",
              value: clients.reduce((total, client) => total + client.photo_count, 0),
              icon: ImageIcon,
            },
            { label: "Storage used", value: `${usage.storageGb.toFixed(2)} GB`, icon: HardDrive },
            { label: "Active plan", value: plan?.name ?? "Pending", icon: UserRound },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="card p-5">
                <Icon size={20} className="text-copper" />
                <strong className="mt-5 block text-2xl">{stat.value}</strong>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[.1em] text-black/38">
                  {stat.label}
                </span>
              </article>
            );
          })}
        </section>

        <section className="card mt-6 overflow-hidden">
          <div className="border-b border-black/8 p-6">
            <h2 className="text-lg font-black">Payment history</h2>
            <p className="mt-1 text-sm text-black/48">
              Your recent subscription attempts and completed payments.
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length ? (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>{new Date(subscription.created_at).toLocaleDateString()}</td>
                      <td>{subscription.pricing_plans?.name ?? "Plan"}</td>
                      <td>
                        {subscription.pricing_plans?.currency ?? "GHS"}{" "}
                        {Number(subscription.amount).toFixed(2)}
                      </td>
                      <td className="capitalize">{subscription.status}</td>
                      <td>
                        <code className="text-xs">{subscription.transaction_id}</code>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-black/42">
                      No payment history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
          <div className="grid gap-6">
            <article className="card p-6">
              <h2 className="text-lg font-black">Plan usage</h2>
              <div className="mt-6 grid gap-6">
                <UsageMeter
                  label="Galleries"
                  value={`${usage.galleries} / ${plan?.max_galleries ?? 0}`}
                  percent={galleryPercent}
                />
                <UsageMeter
                  label="Storage"
                  value={`${usage.storageGb.toFixed(2)} / ${plan?.max_storage_gb ?? 0} GB`}
                  percent={storagePercent}
                />
              </div>
            </article>

            <article className="card p-6">
              <div className="flex items-center gap-2">
                <Plus size={19} className="text-copper" />
                <h2 className="text-lg font-black">New client gallery</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-black/50">
                Choose the first password now. The client can use the username in the client portal.
              </p>
              <form action={addClient} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  Client name
                  <input name="client_name" className="field" required />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">
                    Username
                    <input name="username" className="field" required />
                  </label>
                  <label className="grid gap-2 text-sm font-bold">
                    Email (optional)
                    <input name="email" type="email" className="field" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-bold">
                  Initial password
                  <input name="password" type="password" className="field" minLength={8} required />
                </label>
                <button className="button-primary justify-self-start">
                  <Plus size={16} /> Create gallery
                </button>
              </form>
            </article>
          </div>

          <article className="card min-w-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/8 p-6">
              <div>
                <h2 className="text-lg font-black">Your clients</h2>
                <p className="mt-1 text-sm text-black/45">{clients.length} galleries</p>
              </div>
            </div>
            {clients.length ? (
              <div className="divide-y divide-black/8">
                {clients.map((client) => (
                  <div key={client.id} className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black">{client.client_name}</h3>
                        <p className="mt-1 text-sm text-black/48">
                          @{client.username} · {client.photo_count} photos
                        </p>
                      </div>
                      <Link href={`/photographer/clients/${client.id}`} className="button-secondary">
                        Manage gallery
                      </Link>
                    </div>
                    <div className="mt-4 grid gap-3 rounded-xl bg-black/[0.025] p-3 sm:grid-cols-[1fr_auto]">
                      <form action={resetClientPassword} className="flex flex-col gap-2 sm:flex-row">
                        <input type="hidden" name="client_id" value={client.id} />
                        <input
                          name="new_password"
                          type="password"
                          className="field min-w-0"
                          placeholder="Set a new password"
                          minLength={8}
                          required
                        />
                        <button className="button-secondary shrink-0">Reset password</button>
                      </form>
                      <form action={deleteClient}>
                        <input type="hidden" name="client_id" value={client.id} />
                        <button className="button-danger w-full">Delete</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-sm text-black/45">
                No clients yet. Create the first private gallery.
              </div>
            )}
          </article>
        </section>
      </div>
    </PortalShell>
  );
}

function UsageMeter({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-black/48">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/8">
        <div
          className={`h-full rounded-full ${percent >= 90 ? "bg-red-500" : "bg-copper"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
