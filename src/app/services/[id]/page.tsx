import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getService } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <>
      <SiteHeader />
      <main className="py-14 sm:py-20">
        <article className="container-shell">
          <Link href="/#services" className="inline-flex items-center gap-2 text-sm font-bold text-copper">
            <ArrowLeft size={16} /> Back to services
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
            <div className="relative aspect-square overflow-hidden rounded-[1.7rem] bg-cream">
              <Image
                src={service.image_url || "/images/service-1.webp"}
                alt={service.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div>
              <span className="eyebrow">Photography service</span>
              <h1 className="display-title mt-5 text-5xl leading-tight">{service.title}</h1>
              <p className="mt-6 leading-8 text-black/58">{service.description}</p>
              <ul className="mt-7 grid gap-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <Check className="shrink-0 text-copper" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {service.duration ? (
                  <span className="button-secondary">
                    <Clock size={16} /> {service.duration}
                  </span>
                ) : null}
                <Link href="/#contact" className="button-primary">
                  <Mail size={16} /> Request availability
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
