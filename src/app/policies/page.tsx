import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { NapBlock } from "@/components/seo/NapBlock";
import { Container } from "@/components/Section";
import { brand } from "@/data/site";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Policies — Privacy, Terms & Trust",
  description:
    "Creative Logo Makers policies hub: privacy, terms, contact, and business details for USA clients.",
  path: "/policies",
  keywords: [
    "Creative Logo Makers policies",
    "privacy policy",
    "terms of service",
  ],
});

const links = [
  {
    href: "/privacy",
    title: "Privacy Policy",
    body: "How we collect, use, and protect account, project, and analytics data.",
  },
  {
    href: "/terms",
    title: "Terms & Conditions",
    body: "Contests, 1-to-1 projects, Studio services, payments, and IP ownership.",
  },
  {
    href: "/contact",
    title: "Contact",
    body: "Reach support and sales with the same NAP details used across the site.",
  },
  {
    href: "/about",
    title: "About",
    body: "Company story, stats, and how we connect businesses with designers.",
  },
];

export default function PoliciesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Policies", path: "/policies" },
        ]}
      />
      <PageHero
        eyebrow="Trust & safety"
        title="Policies that back the brand promise"
        description="Clear rules for privacy, terms, and how to reach us — part of the E-E-A-T signal Google and clients expect."
        image={media.about}
        accent="#834692"
      >
        <Button href="/contact" variant="primary">
          Contact {brand.shortName}
        </Button>
      </PageHero>

      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
            <div className="grid gap-4 sm:grid-cols-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-ink"
                >
                  <h2 className="text-lg font-bold text-ink">{l.title}</h2>
                  <p className="mt-2 text-sm text-muted">{l.body}</p>
                  <p className="mt-3 text-sm font-semibold text-hero">Open →</p>
                </Link>
              ))}
            </div>
            <NapBlock serviceArea="United States" />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
