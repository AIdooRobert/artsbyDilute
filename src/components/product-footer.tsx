import Link from "next/link";
import { Camera } from "lucide-react";

export function ProductFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink py-10 text-white">
      <div className="container-shell flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/snapfolio" className="flex items-center gap-2 font-black">
          <Camera size={19} className="text-copper" /> SnapFolio
        </Link>
        <div className="flex flex-wrap gap-5 text-sm text-white/52">
          <Link href="/pricing">Pricing</Link>
          <Link href="/photographer/login">Photographer login</Link>
          <Link href="/client/login">Client login</Link>
          <Link href="/">Creator portfolio</Link>
        </div>
      </div>
    </footer>
  );
}
