import { Suspense } from "react";
import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { DesignerGrid } from "@/components/DesignerGrid";
import { PackageGrid } from "@/components/PackageGrid";
import { PageHero } from "@/components/PageHero";
import { ProjectsDesignerRedirect } from "@/components/ProjectsDesignerRedirect";
import { Container, SectionHeading } from "@/components/Section";
import { media } from "@/data/media";
import { projectPackages } from "@/data/packages";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("projects", "/projects");

/** Static HTML for crawl — ?designer= redirect runs client-side. */
export const revalidate = 86400;

export default function ProjectsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ProjectsDesignerRedirect />
      </Suspense>
      <PageHero
        eyebrow="1-to-1 collaboration"
        title="Hire a designer. Build together."
        description="Already know the vibe? Work directly with a matched specialist — milestone payments, private chat, and deep iteration."
        image={media.projects}
        accent="#2486cb"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/designers/search" variant="primary">
            Browse designers
          </Button>
          <Button href="/get-started" variant="secondary">
            Start a project
          </Button>
        </div>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <SectionHeading title="Project packages" />
          <p className="mt-3 max-w-2xl text-muted">
            Base package ranges — when you invite a specific designer, prices
            adjust to their level and category (same as Creative Logo Makers 1-to-1).
          </p>
          <div className="mt-10">
            <PackageGrid packages={projectPackages} ctaHref="/designers/search" />
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <SectionHeading title="Featured designers ready to collaborate" />
          <div className="mt-10">
            <DesignerGrid limit={4} />
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
