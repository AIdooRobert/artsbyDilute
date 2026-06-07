import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPortfolioItem } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PortfolioDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPortfolioItem(id);
  if (!item) notFound();

  return (
    <>
      <SiteHeader />
      <main className="py-14 sm:py-20">
        <article className="container-shell">
          <Link href="/#portfolio" className="inline-flex items-center gap-2 text-sm font-bold text-copper">
            <ArrowLeft size={16} /> Back to portfolio
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem] bg-cream">
              <Image
                src={item.image_url || "/images/portfolio-1.webp"}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <div>
              <span className="eyebrow">{item.category || "Project"}</span>
              <h1 className="display-title mt-5 text-5xl leading-tight">{item.title}</h1>
              <p className="mt-6 text-base leading-8 text-black/58">{item.description}</p>
              {item.link ? (
                <a href={item.link} className="button-primary mt-8" target="_blank" rel="noreferrer">
                  Visit project <ArrowUpRight size={16} />
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
