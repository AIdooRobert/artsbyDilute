"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  CreditCard,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/settings", "Portfolio settings", Settings],
  ["/admin/portfolio", "Portfolio", ImageIcon],
  ["/admin/services", "Services", Wrench],
  ["/admin/team", "Team", Users],
  ["/admin/skills", "Skills", Sparkles],
  ["/admin/resume", "Resume", FileText],
  ["/admin/testimonials", "Testimonials", Star],
  ["/admin/product-settings", "SnapFolio settings", Settings],
  ["/admin/pricing", "Pricing", CreditCard],
  ["/admin/messages", "Messages", Mail],
  ["/admin/photographers", "Photographers", Camera],
  ["/admin/payments", "Payments", CreditCard],
  ["/admin/users", "Admin users", Users],
  ["/admin/security", "Security", ShieldCheck],
  ["/admin/activity", "Activity", Activity],
] as const;

export function AdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <>
      <Link href="/admin" className="flex items-center gap-2 px-3 text-lg font-black">
        <span className="grid size-9 place-items-center rounded-full bg-copper text-white">
          <Camera size={18} />
        </span>
        SnapFolio
      </Link>
      <nav className="mt-7 grid gap-0.5 overflow-y-auto">
        {links.map(([href, label, Icon]) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${
                active ? "bg-ink text-white" : "text-black/54 hover:bg-cream hover:text-ink"
              }`}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-black/8 pt-4">
        <p className="px-3 text-[10px] font-black uppercase tracking-[.14em] text-copper">Superadmin</p>
        <p className="mt-1 truncate px-3 text-xs font-bold text-black/45">{name}</p>
        <form action={logout} className="mt-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">
            <LogOut size={17} /> Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="dashboard-grid bg-[#f8f6f1]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-black/8 bg-white p-5 lg:flex">
        {nav}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-black/8 bg-white/92 px-4 backdrop-blur lg:hidden">
          <Link href="/admin" className="font-black">SnapFolio Admin</Link>
          <button
            className="grid size-11 place-items-center rounded-full border border-black/10"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu size={20} />
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 bg-black/35 lg:hidden">
            <aside className="flex h-full w-[min(88vw,330px)] flex-col bg-white p-5">
              <button
                className="mb-4 ml-auto grid size-10 place-items-center rounded-full border border-black/10"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
              >
                <X size={18} />
              </button>
              {nav}
            </aside>
          </div>
        ) : null}
        <main className="p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
