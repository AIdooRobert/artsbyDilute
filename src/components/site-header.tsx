"use client";

import Link from "next/link";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#resume", label: "Resume" },
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/#services", label: "Services" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-[#fffdf8]/92 backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-white">
            <Code2 size={18} />
          </span>
          @rtsbyDilute
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-black/64 hover:text-copper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/snapfolio" className="button-primary">
            Explore SnapFolio
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-black/10 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-black/8 bg-paper px-4 py-5 md:hidden">
          <nav className="container-shell grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-semibold hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3">
              <Link href="/snapfolio" className="button-primary w-full">
                Explore SnapFolio
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
