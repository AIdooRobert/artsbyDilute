"use client";

import Link from "next/link";
import { Camera, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/snapfolio#features", label: "Features" },
  { href: "/snapfolio#workflow", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export function ProductHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-white backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href="/snapfolio" className="flex items-center gap-2 font-black">
          <span className="grid size-9 place-items-center rounded-full bg-copper text-white">
            <Camera size={18} />
          </span>
          SnapFolio
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-white/64 hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="text-sm font-semibold text-copper hover:text-white">
            Creator portfolio
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/client/login" className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white hover:text-ink">
            Client login
          </Link>
          <Link href="/photographer/login" className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink hover:bg-copper hover:text-white">
            Studio portal
          </Link>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-white/20 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle product navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-4 py-5 md:hidden">
          <nav className="container-shell grid gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-white/8">
                {link.label}
              </Link>
            ))}
            <Link href="/" className="rounded-xl px-3 py-3 font-semibold text-copper">Creator portfolio</Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/client/login" className="rounded-full border border-white/20 px-3 py-3 text-center text-sm font-bold">Client login</Link>
              <Link href="/photographer/login" className="rounded-full bg-white px-3 py-3 text-center text-sm font-bold text-ink">Studio portal</Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
