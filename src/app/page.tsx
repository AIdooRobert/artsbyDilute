import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  ExternalLink,
  Mail,
  MapPin,
  Quote,
} from "lucide-react";
import { sendContactMessage } from "@/app/actions/public";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SubmitButton } from "@/components/submit-button";
import {
  getPortfolio,
  getResumeItems,
  getServices,
  getSiteSettings,
  getSkills,
  getTestimonials,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PortfolioHome({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const [settings, portfolio, services, skills, resume, testimonials, query] =
    await Promise.all([
      getSiteSettings(),
      getPortfolio(6),
      getServices(6),
      getSkills(),
      getResumeItems(),
      getTestimonials(),
      searchParams,
    ]);

  const skillGroups = Object.groupBy(skills, (skill) => skill.category);
  const resumeGroups = Object.groupBy(resume, (item) => item.type);

  return (
    <>
      <SiteHeader />
      <main>
        <section id="hero" className="relative overflow-hidden bg-cream py-16 sm:py-24 lg:min-h-[760px]">
          <div className="pointer-events-none absolute -right-20 -top-20 size-[420px] rounded-full border border-copper/20" />
          <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative z-10">
              <span className="eyebrow">Designer · Developer · Problem solver</span>
              <h1 className="display-title mt-6 max-w-3xl text-5xl leading-[.98] sm:text-6xl lg:text-7xl">
                I build digital products that are useful, clear, and made to last.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-black/60 sm:text-lg">
                {settings.site_description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#portfolio" className="button-primary">
                  View my work <ArrowRight size={17} />
                </Link>
                <Link href="#contact" className="button-secondary">
                  Start a project
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-black/54">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-copper" /> Web and software
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-copper" /> Product design
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-copper" /> {settings.location}
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="absolute -left-5 top-12 z-10 rounded-2xl bg-white p-4 shadow-xl sm:-left-10">
                <Code2 className="text-copper" />
                <p className="mt-2 text-xs font-bold">Ideas into working products</p>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_35px_90px_rgba(35,29,22,.2)]">
                <Image
                  src={settings.hero_image_url || "/legacy/profile/hero.jpeg"}
                  alt={settings.author_name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 right-4 rounded-2xl bg-ink px-5 py-4 text-white shadow-xl">
                <p className="display-title text-2xl">{settings.about_stat_1_value ?? "150+"}</p>
                <p className="text-xs text-white/58">{settings.about_stat_1_label}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 sm:py-28">
          <div className="container-shell grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem]">
              <Image
                src={settings.about_image_url || "/legacy/profile/about.jpeg"}
                alt={settings.author_name}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
            <div className="lg:pl-10">
              <SectionHeading
                eyebrow="About me"
                title={settings.about_title}
                copy={settings.about_description_1}
              />
              <p className="mt-5 leading-8 text-black/58">{settings.about_description_2}</p>
              <div className="mt-9 grid grid-cols-3 gap-3 border-y border-black/8 py-7">
                {[1, 2, 3].map((index) => (
                  <div key={index}>
                    <strong className="display-title block text-2xl sm:text-3xl">
                      {settings[`about_stat_${index}_value`]}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-black/48">
                      {settings[`about_stat_${index}_label`]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <a href={settings.social_github || "https://github.com"} className="button-secondary" aria-label="GitHub">
                  <Code2 size={17} />
                </a>
                <a href={settings.social_linkedin || "https://linkedin.com"} className="button-secondary" aria-label="LinkedIn">
                  <BriefcaseBusiness size={17} />
                </a>
                <a href={`mailto:${settings.author_email}`} className="button-secondary">
                  <Mail size={17} /> {settings.author_email}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="bg-ink py-20 text-white sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Capabilities"
              title="A practical mix of engineering, design, and product thinking."
              copy="I work across the whole journey, from shaping the problem to designing and shipping the final experience."
              dark
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(skillGroups).map(([category, items]) => (
                <article key={category} className="rounded-[1.4rem] border border-white/10 bg-white/[.04] p-6">
                  <h3 className="display-title text-2xl">{category}</h3>
                  <div className="mt-6 grid gap-5">
                    {(items ?? []).map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="font-bold">{skill.skill_name}</span>
                          <span className="text-white/45">{skill.proficiency}%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-copper" style={{ width: `${skill.proficiency}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="resume" className="py-20 sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Resume"
              title="Experience shaped by building real things."
              copy="A concise view of the roles, projects, and learning behind my work."
            />
            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              {Object.entries(resumeGroups).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-xs font-black uppercase tracking-[.16em] text-copper">{type}</h3>
                  <div className="mt-5 grid gap-4">
                    {(items ?? []).map((item) => (
                      <article key={item.id} className="card p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                          <div>
                            <h4 className="text-lg font-black">{item.title}</h4>
                            <p className="mt-1 text-sm font-semibold text-copper">
                              {[item.company, item.subtitle].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-black/40">
                            {item.year_from} – {item.year_to || "Present"}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-black/55">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="bg-cream py-20 sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Selected work"
              title="Products and experiences made with intention."
              copy="A selection of web, software, product, and creative projects."
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <Link key={item.id} href={`/portfolio/${item.id}`} className="group overflow-hidden rounded-[1.4rem] bg-white shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image_url || "/images/portfolio-1.webp"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-black uppercase tracking-[.14em] text-copper">{item.category}</span>
                    <h3 className="display-title mt-2 text-2xl">{item.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/52">{item.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                      View project <ExternalLink size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="py-20 sm:py-28">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Services"
              title="Focused help for ambitious digital work."
              copy="Engagements can cover one clear deliverable or the full journey from strategy to launch."
              center
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {services.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`} className="card p-7 hover:-translate-y-1 hover:border-copper/40">
                  <span className="grid size-12 place-items-center rounded-full bg-cream text-copper">
                    <Code2 size={22} />
                  </span>
                  <h3 className="display-title mt-6 text-2xl">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/56">{service.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-copper">
                    View service <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {testimonials.length ? (
        <section id="testimonials" className="bg-ink py-20 text-white sm:py-28">
          <div className="container-shell">
            <SectionHeading eyebrow="Client feedback" title="Trusted to make complex work feel clear." dark center />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="rounded-[1.4rem] border border-white/10 bg-white/[.04] p-7">
                  <Quote className="text-copper" size={26} />
                  <blockquote className="display-title mt-5 text-2xl leading-snug">
                    “{testimonial.testimonial_text}”
                  </blockquote>
                  <p className="mt-6 text-sm font-bold">{testimonial.client_name}</p>
                  <p className="mt-1 text-xs text-white/45">{testimonial.client_position}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        <section id="contact" className="bg-copper py-20 text-white sm:py-28">
          <div className="container-shell grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <span className="text-xs font-black uppercase tracking-[.18em] text-white/66">Start a conversation</span>
              <h2 className="display-title mt-5 text-4xl leading-tight sm:text-5xl">
                Have an idea worth building?
              </h2>
              <p className="mt-5 max-w-md leading-8 text-white/72">
                Tell me what you are trying to achieve, what is getting in the way, and what a good result looks like.
              </p>
              {query.contact ? (
                <p className="mt-6 rounded-xl bg-white/12 p-4 text-sm font-semibold">
                  {query.contact === "sent"
                    ? "Message received. I will get back to you soon."
                    : query.contact === "demo"
                      ? "Demo mode is active. Connect Supabase to store contact messages."
                      : query.contact === "rate"
                        ? "Too many messages were submitted. Please wait a few minutes and try again."
                      : "Please check the form and try again."}
                </p>
              ) : null}
            </div>
            <form action={sendContactMessage} className="grid gap-4 rounded-[1.5rem] bg-white p-6 text-ink sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">Name<input name="name" className="field" required /></label>
                <label className="grid gap-2 text-sm font-bold">Email<input name="email" type="email" className="field" required /></label>
              </div>
              <label className="grid gap-2 text-sm font-bold">Subject<input name="subject" className="field" /></label>
              <label className="grid gap-2 text-sm font-bold">Message<textarea name="message" rows={6} className="field resize-y" required /></label>
              <SubmitButton
                className="button-primary justify-self-start disabled:cursor-wait disabled:opacity-60"
                pendingLabel="Sending enquiry..."
              >
                Send enquiry <ArrowRight size={16} />
              </SubmitButton>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
