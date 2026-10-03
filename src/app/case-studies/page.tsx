import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { caseStudies } from "@/data/case-studies";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies — Before & After Brand Results",
  description:
    "Real Creative Logo Makers case studies: before/after logos, packaging, websites, and merch results for USA brands.",
  path: "/case-studies",
  keywords: [
    "logo design case study",
    "branding before after",
    "packaging design results",
    "Creative Logo Makers case studies",
  ],
});

export default function CaseStudiesIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Case studies", path: "/case-studies" },
        ]}
      />
      <PageHero
        eyebrow="Results"
        title="Case studies with before & after outcomes"
        description="Shareable stories for US brands — challenge, approach, and measurable brand results across logo, web, packaging, and merch."
        image={media.studio}
        accent="#2486cb"
      >
        <Button href="/get-started" variant="primary">
          Start your project
        </Button>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {caseStudies.map((c) => (
              <Link
                key={c.slug}
                href={`/case-studies/${c.slug}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="grid grid-cols-2">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={c.beforeImage}
                      alt={c.beforeAlt}
                      fill
                      sizes="25vw"
                      className="object-cover opacity-90"
                    />
                    <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={c.afterImage}
                      alt={c.afterAlt}
                      fill
                      sizes="25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded bg-hero px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      After
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-hero">
                    {c.industry} · {c.location}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-ink group-hover:text-hero">
                    {c.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {c.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand title="Want results like these?" />
    </>
  );
}
