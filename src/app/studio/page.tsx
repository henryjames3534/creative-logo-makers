import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { clm } from "@/data/clm-assets";
import { media } from "@/data/media";
import {
  studioHubFaqs,
  studioServices,
  studioStrategists,
} from "@/data/studio";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("studio", "/studio");

export default function StudioPage() {
  return (
    <>
      <PageHero
        eyebrow="Full-service branding"
        title="Look established for launch. Stay sharp for a decade."
        description="99d Studio is brought to you by Circlemakers Studio. Your dedicated Brand Strategist partners with you from strategy through identity and launch."
        image={media.studio}
        accent="#3e00cd"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/studio/talk-to-strategist" variant="primary">
            Talk to a Brand Strategist
          </Button>
          <Button href="/studio/full-brand-identity" variant="secondary">
            Full-service brand pack
          </Button>
        </div>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <SectionHeading
            title="Studio services"
            description="Branding from strategy to delivery — same menu as Creative Logo Makers Studio."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studioServices.map((s) => (
              <Link
                key={s.slug}
                href={`/studio/${s.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-md"
              >
                {s.badge ? (
                  <span className="mb-2 w-fit rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                    {s.badge}
                  </span>
                ) : (
                  <span className="mb-2 h-5" />
                )}
                <h3 className="text-lg font-semibold text-ink group-hover:text-violet">
                  {s.shortTitle}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {s.description}
                </p>
                <p className="mt-4 text-sm font-bold text-violet">
                  <LocalizedPrice value={s.price} />
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading title="Meet your Brand Strategists" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {studioStrategists.map((p) => (
              <div
                key={p.name}
                className="flex gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{p.name}</h3>
                  <p className="text-xs font-medium text-violet">{p.location}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button href="/studio/talk-to-strategist" variant="primary">
              Request a call
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-14 md:py-16">
        <Container>
          <div className="mb-10 grid items-center gap-8 lg:grid-cols-2">
            <SectionHeading
              title="Why Studio"
              description="End-to-end Brand Strategist leadership — not a DIY contest brief."
            />
            <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden rounded-2xl shadow-md lg:max-w-none">
              <Image
                src={clm.studioLaura}
                alt="Brand Strategist"
                fill
                sizes="480px"
                quality={90}
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Dedicated strategist",
                d: "One partner leads brief, talent, and deliverables start to finish.",
              },
              {
                t: "Beyond the logo",
                d: "Naming, messaging, campaigns, decks, web, and packaging.",
              },
              {
                t: "Transparent pricing",
                d: "Full-service brand pack from US$4,499 — custom quotes available.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-ink">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading title="FAQs" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {studioHubFaqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title="Book a Studio intro call" />
    </>
  );
}
