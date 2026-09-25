import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PackageGrid } from "@/components/PackageGrid";
import { PageHero } from "@/components/PageHero";
import { Testimonials } from "@/components/Testimonials";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import { contestPackages } from "@/data/packages";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("contests", "/contests");

export default function ContestsPage() {
  return (
    <>
      <PageHero
        eyebrow="Most popular"
        title="Dozens of concepts. One clear winner."
        description="Take branding further. Get professional custom options from our freelance community."
        image={media.contests}
        accent="#00a581"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/get-started" variant="primary">
            Start a contest
          </Button>
          <Button href="/pricing#contests" variant="secondary">
            Compare packages
          </Button>
        </div>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <SectionHeading title="How contests work" />
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              "Write your brief & pick a package",
              "Designers submit concepts",
              "Rate, comment, shortlist favorites",
              "Select a winner & download files",
            ].map((text, i) => (
              <li
                key={text}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl font-bold text-green">0{i + 1}</span>
                <p className="mt-3 text-sm font-semibold leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading title="Contest packages from $249" />
          <div className="mt-10">
            <PackageGrid packages={contestPackages} categorySlug="logo-design" />
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <SectionHeading title="Contest stories" align="center" />
          <div className="mt-10">
            <Testimonials limit={3} />
          </div>
        </Container>
      </section>

      <CtaBand title="Start your contest today" />
    </>
  );
}
