import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import { howItWorksSteps, workModes } from "@/data/site";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("how-it-works", "/how-it-works");

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Ways to work"
        title="How it works"
        description="Collaboration is the key to creativity. We bring brief, talent, and feedback together so you ship design that feels unmistakably yours."
        image={media.howItWorks}
        accent="#00a581"
      />

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {howItWorksSteps.map((step) => (
              <article
                key={step.step}
                className="rounded-2xl border border-line bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-4xl font-bold text-green/30">{step.step}</span>
                <h2 className="mt-3 text-2xl font-bold text-ink">{step.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading
            align="center"
            title="Three ways to get design done"
            description="Contests, 1-to-1 projects, or Studio — pick what fits."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {workModes.map((m) => (
              <div
                key={m.href}
                className="flex flex-col rounded-2xl border border-line bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-green">
                  {m.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-bold">{m.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted">{m.description}</p>
                <p className="mt-4 text-sm font-bold">
                  <LocalizedPrice value={m.price} />
                </p>
                <div className="mt-6">
                  <Button href={m.href} variant="secondary">
                    {m.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title="Ready when you are" />
    </>
  );
}
