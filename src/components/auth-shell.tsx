import Link from "next/link";
import { Camera, ChevronLeft } from "lucide-react";

export function AuthShell({
  title,
  copy,
  children,
  backHref = "/",
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
  backHref?: string;
}) {
  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-[.85fr_1.15fr]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-black">
          <Camera size={22} />
          SnapFolio
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-[.2em] text-copper">
            Studio tools, beautifully organized
          </span>
          <h2 className="display-title mt-5 max-w-lg text-5xl leading-tight">
            From a finished edit to a delighted client.
          </h2>
          <p className="mt-6 max-w-md leading-8 text-white/58">
            Secure galleries, polished presentation, flexible plans, and one clear
            place to run client delivery.
          </p>
        </div>
        <p className="text-xs text-white/38">Private by design. Ready for every screen.</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-xl">
          <Link
            href={backHref}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/54 hover:text-copper"
          >
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="card p-6 sm:p-9">
            <div className="mb-7">
              <div className="mb-5 flex items-center gap-2 font-black lg:hidden">
                <Camera size={20} /> SnapFolio
              </div>
              <h1 className="display-title text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-black/55">{copy}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
