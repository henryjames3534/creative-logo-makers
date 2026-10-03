import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { howItWorksSteps } from "@/data/site";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Design Process — Brief to Production Files",
  description:
    "How Creative Logo Makers runs contests and 1-to-1 projects: brief, concepts, revisions, and production-ready files for USA businesses.",
  path: "/process",
  keywords: [
    "logo design process",
    "how Creative Logo Makers works",
    "design contest process",
  ],
});

const extras = [
  {
    title: "Discovery & brief",
    body: "Audience, competitors, mandatory uses, and dislikes — so designers are not guessing.",
  },
  {
    title: "Concepts you can compare",
    body: "Contests maximize directions; 1-to-1 projects deepen collaboration with one specialist.",
  },
  {
    title: "Revisions with an owner",
    body: "One decision-maker keeps feedback crisp. We refine typography, spacing, and color systems.",
  },
  {
    title: "Files & handoff",
    body: "Vector and raster exports plus usage notes so printers, developers, and ads teams are unblocked.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Process", path: "/process" },
        ]}
      />
      <PageHero
        eyebrow="Experience"
        title="A clear process from brief to brand files"
        description="Experience and expertise show up in how work gets done — not only in the final PNG. Here is the Creative Logo Makers path."
        image={media.howItWorks}
        accent="#2486cb"
      >
        <Button href="/how-it-works" variant="secondary">
          How it works overview
        </Button>
        <Button href="/get-started" variant="primary">
          Start a brief
        </Button>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold text-ink">Core steps</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-hero">
                  {s.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </li>
            ))}
          </ol>

          <h2 className="mt-14 text-2xl font-bold text-ink">
            What makes the process trustworthy
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {extras.map((e) => (
              <div
                key={e.title}
                className="rounded-2xl border border-line bg-paper-soft p-5"
              >
                <h3 className="font-semibold text-ink">{e.title}</h3>
                <p className="mt-2 text-sm text-muted">{e.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/team" variant="secondary">
              Meet designers
            </Button>
            <Button href="/policies" variant="secondary">
              Policies & guarantees
            </Button>
            <Button href="/contact" variant="primary">
              Contact us
            </Button>
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
