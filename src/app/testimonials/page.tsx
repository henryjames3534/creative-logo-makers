import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { testimonials } from "@/data/content";
import { media } from "@/data/media";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Client Testimonials — Names, Photos & Project Proof",
  description:
    "Read Creative Logo Makers client testimonials with names, roles, photos, and project visuals from USA and global brands.",
  path: "/testimonials",
  keywords: [
    "Creative Logo Makers reviews",
    "logo design testimonials",
    "branding client feedback",
  ],
});

export default function TestimonialsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          review: testimonials.map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            reviewBody: t.quote,
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
          })),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Testimonials", path: "/testimonials" },
        ]}
      />
      <PageHero
        eyebrow="Trust"
        title="Clients with names, faces, and finished work"
        description="E-E-A-T starts with real people. Here are client stories paired with project visuals — not anonymous star dumps."
        image={media.team}
        accent="#834692"
      >
        <Button href="/case-studies" variant="primary">
          See case studies
        </Button>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <article
                key={t.name + t.role}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={t.projectImage ?? t.image}
                    alt={`${t.name} project`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-4 p-6">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="leading-relaxed text-ink">“{t.quote}”</p>
                    <p className="mt-3 font-bold text-ink">{t.name}</p>
                    <p className="text-sm text-muted">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Prefer proof with process? Explore{" "}
            <a href="/case-studies" className="font-semibold text-hero hover:underline">
              before/after case studies
            </a>{" "}
            or{" "}
            <a href="/contact" className="font-semibold text-hero hover:underline">
              contact us
            </a>
            .
          </p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
