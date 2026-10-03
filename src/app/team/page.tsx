import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { designers } from "@/data/designers";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Designers — Bios, Skills & Profiles",
  description:
    "Meet Creative Logo Makers designers: bios, specialties, ratings, and portfolio samples — expertise you can verify.",
  path: "/team",
  keywords: [
    "hire logo designer",
    "Creative Logo Makers designers",
    "designer bios",
  ],
});

function featuredDesigners() {
  return [...designers]
    .filter((d) => d.countryCode === "US" || d.level === "top")
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 12);
}

export default function TeamPage() {
  const people = featuredDesigners();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ]}
      />
      <PageHero
        eyebrow="Expertise"
        title="Designer bios you can open and verify"
        description="E-E-A-T needs people with names, specialties, and track records. Browse featured Creative Logo Makers designers — then open full profiles."
        image={media.designers}
        accent="#2486cb"
      >
        <Button href="/designers/search" variant="primary">
          Search all designers
        </Button>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((d) => (
              <Link
                key={d.id}
                href={`/designers/${d.id}`}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={d.image || d.avatar}
                    alt={d.name}
                    fill
                    sizes="33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line">
                      <Image
                        src={d.avatar || d.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-ink group-hover:text-hero">
                        {d.name}
                      </h2>
                      <p className="text-xs text-muted">
                        {d.location} · {d.level} · {d.rating.toFixed(1)} (
                        {d.reviews} reviews)
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink">
                    {d.specialty}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{d.bio}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Existing designer profile URLs are unchanged — this page only
            highlights them.{" "}
            <Link href="/designers" className="font-semibold text-hero hover:underline">
              Become a designer
            </Link>
          </p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
