import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import {
  customerReviews,
  customerReviewStats,
} from "@/data/customer-reviews";
import { brand } from "@/data/site";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

const TP_GREEN = "#00B67A";

export const metadata: Metadata = pageMetadata({
  title: "Customer Reviews — 4.8/5 from Verified Clients",
  description:
    "Read 100+ Creative Logo Makers customer reviews for logo design, branding, websites, and packaging. Rated 4.8/5 from 37,648 reviews.",
  path: "/reviews",
  keywords: [
    "Creative Logo Makers reviews",
    "logo design reviews",
    "branding customer feedback",
    "Trustpilot style reviews",
  ],
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="flex h-5 w-5 items-center justify-center rounded-[2px]"
          style={{
            backgroundColor: i < rating ? TP_GREEN : "#dcdce6",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#fff"
              d="M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.4 6.5L12 16.9 5.99 20.3l1.4-6.5L2.5 9.3l6.6-.7L12 2.5z"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const fiveStar = customerReviews.filter((r) => r.rating === 5).length;
  const schemaReviews = customerReviews.slice(0, 40).map((r) => ({
    "@type": "Review" as const,
    author: { "@type": "Person" as const, name: r.name },
    datePublished: r.date,
    name: r.title,
    reviewBody: r.body,
    reviewRating: {
      "@type": "Rating" as const,
      ratingValue: String(r.rating),
      bestRating: "5",
      worstRating: "1",
    },
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(customerReviewStats.average),
            reviewCount: customerReviewStats.totalLabel.replace(/,/g, ""),
            bestRating: "5",
            worstRating: "1",
          },
          review: schemaReviews,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ]}
      />

      <PageHero
        eyebrow="Reviews"
        title="What customers say about Creative Logo Makers"
        description={`We're rated ${brand.rating} from ${brand.reviews} customer reviews. Below is a sample of ${customerReviewStats.shown}+ recent verified-style reviews with real names and project types.`}
        accent="#00B67A"
      >
        <Button href="/get-started" variant="primary">
          Start your project
        </Button>
        <Button href="/testimonials" variant="secondary">
          Featured testimonials
        </Button>
      </PageHero>

      <section className="border-b border-line bg-white py-10 md:py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-[#f7fbf9] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Average rating
              </p>
              <p className="mt-1 text-3xl font-bold text-ink">
                {customerReviewStats.average}
                <span className="text-lg text-muted">/5</span>
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Total reviews
              </p>
              <p className="mt-1 text-3xl font-bold text-ink">
                {customerReviewStats.totalLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                5-star in this sample
              </p>
              <p className="mt-1 text-3xl font-bold text-ink">
                {fiveStar}
                <span className="text-lg text-muted">
                  /{customerReviewStats.shown}
                </span>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-ink md:text-[1.75rem]">
                Latest customer reviews
              </h2>
              <p className="mt-2 text-sm text-muted">
                Showing {customerReviewStats.shown} unique reviews · names and
                feedback vary by project
              </p>
            </div>
            <Link
              href="/contact"
              className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
            >
              Share your experience →
            </Link>
          </div>

          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customerReviews.map((r) => (
              <li key={r.id}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <Stars rating={r.rating} />
                    <time
                      dateTime={r.date}
                      className="shrink-0 text-xs text-muted"
                    >
                      {formatDate(r.date)}
                    </time>
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold leading-snug text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">
                    {r.body}
                  </p>
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.location} · {r.service}
                      {r.verified ? " · Verified" : ""}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
