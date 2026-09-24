import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/Section";
import { inspirationItems } from "@/data/content";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Design Inspiration",
  description:
    "Tips, trends, and creative direction from real Creative Logo Makers projects.",
  path: "/inspiration",
});

export default function InspirationPage() {
  return (
    <>
      <PageHero
        eyebrow="Ideas & stories"
        title="Inspiration that moves brands"
        description="Tips, trends, and tons of creative direction from real projects across logos, packaging, web, and merchandise."
        image={media.blog2}
        accent="#2486cb"
      >
        <Button href="/get-started" variant="primary">
          Start your brand
        </Button>
      </PageHero>
      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inspirationItems.map((item) => (
              <Link
                key={item.id}
                href="/get-started"
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    quality={90}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-ink transition-colors group-hover:text-hero">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {item.designer} · {item.mood}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand title="Inspired? Make it yours." />
    </>
  );
}
