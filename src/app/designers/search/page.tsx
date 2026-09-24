import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DesignerSearch } from "@/components/DesignerSearch";
import { Container } from "@/components/Section";
import { designerHeroImage } from "@/data/designers-meta";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find a Designer",
  description:
    "Browse professional designers across 90+ skill sets. Filter by category, industry, level, and availability.",
  path: "/designers/search",
  keywords: ["hire graphic designer", "find logo designer", "freelance designer"],
});

export default async function DesignersSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; categories?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.skill || sp.categories || "all";
  const aliases: Record<string, string> = {
    packaging: "product-packaging-design",
    illustration: "illustrations",
    merchandise: "merchandise-design",
    "book-cover": "book-cover-design",
    "brand-identity": "brand-identity-pack",
    social: "social-media-page-design",
    print: "print-design",
    "3d": "3d-design",
    web: "web-design",
  };
  const initialSkill = aliases[raw] ?? raw;

  return (
    <>
      <section className="border-b border-line bg-[#f6f5f2]">
        <Container className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-14">
          <div>
            <nav className="text-sm text-muted">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-ink">Find a designer</span>
            </nav>
            <h1 className="mt-4 max-w-xl font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Find a designer you&apos;ll love
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink/70">
              We have professional designers in over 90 design skill sets.
              <br />
              Browse featured talent — or filter to find the perfect match.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[361/309] w-full">
              <Image
                src={designerHeroImage}
                alt="Illustration by obicatlia"
                fill
                priority
                sizes="(max-width:768px) 90vw, 420px"
                className="object-contain"
              />
            </div>
            <p className="mt-3 text-right text-xs text-muted">
              “Book cover, done!” — by obicatlia
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-10 md:py-14">
        <Container>
          <DesignerSearch initialSkill={initialSkill} />
        </Container>
      </section>
    </>
  );
}
