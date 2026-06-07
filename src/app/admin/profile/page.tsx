import {
  CalendarDays,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { updateAdminProfile } from "@/app/actions/admin";
import { AdminShell } from "@/components/admin-shell";
import { StatusMessage } from "@/components/status-message";
import { SubmitButton } from "@/components/submit-button";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Superadmin profile" };

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [user, query] = await Promise.all([
    requireRole("admin"),
    searchParams,
  ]);
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const displayName = profile?.display_name ?? user.email ?? "Superadmin";

  return (
    <AdminShell name={displayName}>
      <div className="mx-auto max-w-4xl">
        <span className="eyebrow">Your account</span>
        <h1 className="display-title mt-3 text-4xl">Superadmin profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
          Manage the identity used across the administration console. Email
          changes apply to your next sign-in.
        </p>

        <div className="mt-5">
          <StatusMessage error={query.error} success={query.success} />
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_280px]">
          <form action={updateAdminProfile} className="card grid gap-5 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-bold text-copper">
              <UserRound size={18} /> Profile details
            </div>
            <label className="grid gap-2 text-sm font-bold">
              Display name
              <input
                name="display_name"
                className="field"
                defaultValue={displayName}
                autoComplete="name"
                minLength={2}
                maxLength={120}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Email address
              <input
                name="email"
                type="email"
                className="field"
                defaultValue={user.email ?? ""}
                autoComplete="email"
                maxLength={160}
                required
              />
            </label>
            <p className="text-xs leading-6 text-black/45">
              Keep this address private and accessible. It is used to sign in
              and recover the superadmin account.
            </p>
            <SubmitButton
              className="button-primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-fit"
              pendingLabel="Saving profile..."
            >
              Save profile
            </SubmitButton>
          </form>

          <aside className="grid content-start gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck size={18} className="text-copper" />
                Account status
              </div>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[.1em] text-black/35">
                    Role
                  </dt>
                  <dd className="mt-1 font-bold">Superadmin</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-[.1em] text-black/35">
                    <CalendarDays size={13} /> Account created
                  </dt>
                  <dd className="mt-1 font-semibold text-black/60">
                    {formatDate(user.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-bold uppercase tracking-[.1em] text-black/35">
                    <Mail size={13} /> Last sign-in
                  </dt>
                  <dd className="mt-1 font-semibold text-black/60">
                    {formatDate(user.last_sign_in_at)}
                  </dd>
                </div>
              </dl>
            </div>
            <Link
              href="/admin/security"
              className="card flex items-center justify-between gap-4 p-5 hover:-translate-y-0.5"
            >
              <span>
                <strong className="block text-sm">Password and security</strong>
                <span className="mt-1 block text-xs leading-5 text-black/45">
                  Change your password and secure access.
                </span>
              </span>
              <ShieldCheck size={20} className="shrink-0 text-copper" />
            </Link>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
