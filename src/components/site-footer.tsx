import Link from "next/link";
import { BriefcaseBusiness, Code2, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink py-12 text-white">
      <div className="container-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-black">
            <Code2 size={22} />
            @rtbyDilute
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/58">
            Design, software, and digital products built with clarity and care.
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/64">
          <a href="mailto:robertaidoo62@gmail.com" aria-label="Email">
            <Mail size={19} />
          </a>
          <a href="https://github.com/AIdooRobert" aria-label="GitHub">
            <Code2 size={19} />
          </a>
          <a href="https://linkedin.com/in/Robert-Aidoo" aria-label="LinkedIn">
            <BriefcaseBusiness size={19} />
          </a>
          <span className="text-xs">&copy; {new Date().getFullYear()} Robert Aidoo</span>
        </div>
      </div>
    </footer>
  );
}
