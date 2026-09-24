import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { DesignerGrid } from "@/components/DesignerGrid";
import { PackageGrid } from "@/components/PackageGrid";
import { PageHero } from "@/components/PageHero";
import { Container, SectionHeading } from "@/components/Section";
import { getDesignerByHandle } from "@/data/designers";
import { media } from "@/data/media";
import { projectPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "1-to-1 Design Projects",
  description:
    "Hire a dedicated designer for focused, collaborative logo, web, and branding projects.",
  path: "/projects",
});

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ designer?: string }>;
}) {
  const sp = await searchParams;
  if (sp.designer) {
    const d = getDesignerByHandle(sp.designer);
    if (d) redirect(`/designers/${d.id}?tab=invite`);
    redirect("/designers/search");
  }

  return (
    <>
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
