import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DesignerSearch } from "@/components/DesignerSearch";
import { Container } from "@/components/Section";
import { designerHeroImage } from "@/data/designers-meta";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("designers", "/designers/search");

/** Static for crawl — skill filters apply client-side. */
export const revalidate = 86400;

export default function DesignersSearchPage() {
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
          <Suspense fallback={null}>
            <DesignerSearch />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
