import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import {
  ALL_USA_KEYWORD_PAGES,
  GSC_PRIORITY_SLUGS,
  USA_INTENTS,
  getIntentBySlug,
  intentPath,
} from "@/data/usa-intents";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "USA Design Keywords — Logo Design Services, Brand Agency & More",
  description:
    "USA keyword hub: logo design services, logo designer, brand identity agency, brand strategy agency, rebranding agency, and related commercial design pages.",
  path: "/usa",
  keywords: [
    "logo design services",
    "logo designer",
    "brand identity agency",
    "brand strategy agency",
    "logo design company",
    "custom logo design",
  ],
});

/** Keep hub light for Google — full A–Z lives on /usa/letter/[letter]. */
export const revalidate = 86400;

function letterKey(keyword: string) {
  const ch = keyword.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

export default function UsaIntentsHubPage() {
  const total = ALL_USA_KEYWORD_PAGES.length;
  const featured = USA_INTENTS;

  const counts = new Map<string, number>();
  for (const page of ALL_USA_KEYWORD_PAGES) {
    const key = letterKey(page.keyword);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const letters = [...counts.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return (
    <section className="py-14 md:py-20">
      <Container>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
          United States SEO
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
          USA keyword pages for design services
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/75">
          Directory of{" "}
          <strong className="font-semibold text-ink">
            {total.toLocaleString()}
          </strong>{" "}
          USA design keyword pages. Start with priority phrases below, or browse
          by letter — each letter page stays fast for crawlers and visitors.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {letters.map((L) => (
            <Link
              key={L}
              href={`/usa/letter/${L === "#" ? "other" : L.toLowerCase()}`}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-ink"
            >
              {L}{" "}
              <span className="font-normal text-muted">({counts.get(L)})</span>
            </Link>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-medium text-ink">
          Priority ranking keywords
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          High-intent phrases we are actively strengthening for first-page
          visibility — logo design services, brand identity agency, brand
          strategy, and related commercial searches.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {GSC_PRIORITY_SLUGS.map((slug) => {
            const i = getIntentBySlug(slug);
            if (!i) return null;
            return (
              <Link
                key={slug}
                href={intentPath(slug)}
                className="rounded-full border border-hero/30 bg-hero/5 px-3 py-1.5 text-sm font-semibold text-hero hover:border-hero"
              >
                {i.keyword}
              </Link>
            );
          })}
        </div>

        <h2 className="mt-14 text-xl font-medium text-ink">Featured keywords</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {featured.map((i) => (
            <Link
              key={i.slug}
              href={intentPath(i.slug)}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink"
            >
              {i.keyword}
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="/categories" variant="secondary">
            Browse more packages
          </Button>
          <Button href="/us" variant="secondary">
            US city pages
          </Button>
        </div>
      </Container>
    </section>
  );
}
