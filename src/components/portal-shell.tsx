"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/photographer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/photographer/dashboard", label: "Client galleries", icon: FolderOpen },
  { href: "/photographer/upgrade", label: "Plans and billing", icon: CreditCard },
  { href: "/photographer/profile", label: "Profile and branding", icon: Settings },
];

export function PortalShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigation = (
    <>
      <Link href="/" className="flex items-center gap-2 px-3 text-lg font-black">
        <span className="grid size-9 place-items-center rounded-full bg-copper text-white">
          <Camera size={18} />
        </span>
        SnapFolio
      </Link>
      <nav className="mt-9 grid gap-1">
        {links.map((link, index) => {
          const Icon = link.icon;
          const active =
            index === 0
              ? pathname === "/photographer/dashboard"
              : pathname.startsWith(link.href) && link.href !== "/photographer/dashboard";
          return (
            <Link
              key={`${link.label}-${index}`}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${
                active ? "bg-ink text-white" : "text-black/56 hover:bg-cream hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-black/8 pt-5">
        <p className="px-3 text-xs font-bold uppercase tracking-[.12em] text-black/38">
          Signed in as
        </p>
        <p className="mt-1 truncate px-3 text-sm font-bold">{name}</p>
        <form action={logout} className="mt-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#9d3030] hover:bg-red-50">
            <LogOut size={18} /> Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="dashboard-grid bg-[#f8f6f1]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-black/8 bg-white p-5 lg:flex">
        {navigation}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-black/8 bg-white/92 px-4 backdrop-blur lg:hidden">
          <Link href="/photographer/dashboard" className="flex items-center gap-2 font-black">
            <Camera size={20} /> SnapFolio
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full border border-black/10"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 bg-black/35 lg:hidden">
            <aside className="flex h-full w-[min(86vw,320px)] flex-col bg-white p-5 shadow-2xl">
              <button
                type="button"
                aria-label="Close menu"
                className="mb-5 ml-auto grid size-10 place-items-center rounded-full border border-black/10"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
              {navigation}
            </aside>
          </div>
        ) : null}
        <main className="p-4 sm:p-7 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
