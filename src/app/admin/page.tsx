import Link from "next/link";
import {
  Camera,
  ImageIcon,
  Mail,
  Users,
  Wrench,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboard() {
  const user = await requireRole("admin");
  const admin = createAdminClient();
  const [{ data: profile }, portfolio, services, messages, photographers, clients] =
    await Promise.all([
      admin.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      admin.from("portfolio_items").select("id", { count: "exact", head: true }),
      admin.from("services").select("id", { count: "exact", head: true }),
      admin
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("read_status", false),
      admin.from("photographers").select("id", { count: "exact", head: true }),
      admin.from("photography_clients").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    ["Portfolio items", portfolio.count ?? 0, ImageIcon, "/admin/portfolio"],
    ["Services", services.count ?? 0, Wrench, "/admin/services"],
    ["Unread messages", messages.count ?? 0, Mail, "/admin/messages"],
    ["Photographers", photographers.count ?? 0, Camera, "/admin/photographers"],
    ["Client galleries", clients.count ?? 0, Users, "/admin/photographers"],
  ] as const;

  return (
    <AdminShell name={profile?.display_name ?? user.email ?? "Admin"}>
      <div className="mx-auto max-w-7xl">
        <span className="eyebrow">Superadmin overview</span>
        <h1 className="display-title mt-4 text-4xl">One console, two experiences.</h1>
        <p className="mt-2 text-sm text-black/48">
          Control the personal portfolio and the SnapFolio photography platform independently.
        </p>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(([label, value, Icon, href]) => (
            <Link key={label} href={href} className="card p-5 hover:-translate-y-1">
              <Icon size={20} className="text-copper" />
              <strong className="mt-5 block text-3xl">{value}</strong>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[.1em] text-black/38">
                {label}
              </span>
            </Link>
          ))}
        </section>
        <section className="card mt-6 p-7">
          <h2 className="display-title text-2xl">Portfolio and product, clearly separated</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/50">
            Portfolio settings and content drive the creator website at `/`. SnapFolio
            settings, pricing, photographers, clients, and payments drive the product at
            `/snapfolio`.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
