import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { LocalizedPrice } from "@/components/locale/LocalizedPrice";
import { PackageGrid } from "@/components/PackageGrid";
import { PageHero } from "@/components/PageHero";
import { PricingCategoryTable } from "@/components/PricingCategoryTable";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import {
  addOns,
  getContestPackages,
  projectPackages,
  studioPackages,
} from "@/data/packages";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("pricing", "/pricing");

export default function PricingPage() {
  const logoPackages = getContestPackages("logo-design");

  return (
    <>
      <PageHero
        eyebrow="Transparent pricing"
        title="Packages for every stage"
        description="Contests, 1-to-1 projects, and Studio — clear tiers so you know what you're paying for."
        image={media.pricing}
        accent="#00a581"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#contests" variant="primary">
            Contest packages
          </Button>
          <Button href="#by-category" variant="secondary">
            By category
          </Button>
        </div>
      </PageHero>

      <section id="contests" className="scroll-mt-24 py-14 md:py-16">
        <Container>
          <SectionHeading
            title="Logo design contest packages"
            description="Start a contest from US$125 (was $249). Four fixed packages — higher tiers attract more (and more senior) designers. 50% off sitewide."
          />
          <p className="mt-2 text-sm text-muted">
            Example: from <LocalizedPrice value="US$125" /> (was{" "}
            <LocalizedPrice value="$249" />)
          </p>
          <div className="mt-10">
            <PackageGrid packages={logoPackages} categorySlug="logo-design" />
          </div>
          <p className="mt-6 text-sm text-muted">
            Fixed contest packages · Prices exclude sales tax ·{" "}
            <Link
              href="/categories"
              className="font-semibold text-hero hover:underline"
            >
              Browse all categories
            </Link>
          </p>
        </Container>
      </section>

      <section
        id="by-category"
        className="scroll-mt-24 border-t border-line bg-paper-soft py-14 md:py-16"
      >
        <Container>
          <SectionHeading
            title="Pricing by category"
            description="Each category has its own Bronze → Platinum prices. Open a category to select a package."
          />
          <PricingCategoryTable />
        </Container>
      </section>

      <section
        id="projects"
        className="scroll-mt-24 border-t border-line py-14 md:py-16"
      >
        <Container>
          <SectionHeading
            title="1-to-1 Projects"
            description="Matched specialists, milestone payments, and deep iteration. Pricing is set with your designer."
          />
          <div className="mt-10">
            <PackageGrid packages={projectPackages} ctaHref="/projects" />
          </div>
        </Container>
      </section>

      <section
        id="studio"
        className="scroll-mt-24 border-t border-line bg-paper-soft py-14 md:py-16"
      >
        <Container>
          <SectionHeading
            title="Studio packages"
            description="Brand Strategists and senior creatives — contact for a quote."
          />
          <div className="mt-10">
            <PackageGrid
              packages={studioPackages}
              ctaHref="/studio/talk-to-strategist"
            />
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-14 md:py-16">
        <Container>
          <SectionHeading title="Popular bundles & add-ons" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addOns.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 shadow-sm"
              >
                <span className="font-semibold">{a.name}</span>
                <span className="text-sm font-bold text-green">
                  <LocalizedPrice value={a.price} />
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
