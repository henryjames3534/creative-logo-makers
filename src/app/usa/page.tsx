import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import {
  ALL_USA_KEYWORD_PAGES,
  USA_INTENTS,
  intentPath,
} from "@/data/usa-intents";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "USA Design Keywords — Logo, Web, App & Branding Search Terms",
  description:
    "Browse USA design keyword pages: logo design near me, hire web designer, packaging design, branding agency, and thousands more commercial phrases.",
  path: "/usa",
  keywords: [
    "USA design keywords",
    "logo design near me",
    "hire logo designer",
    "website design USA",
    "branding agency USA",
  ],
});

export default function UsaIntentsHubPage() {
  const featured = USA_INTENTS;
  const more = ALL_USA_KEYWORD_PAGES.filter(
    (p) => !USA_INTENTS.some((i) => i.slug === p.slug),
  ).slice(0, 120);

  const groups = new Map<string, typeof USA_INTENTS>();
  for (const intent of featured) {
    const list = groups.get(intent.serviceSlug) || [];
    list.push(intent);
    groups.set(intent.serviceSlug, list);
  }

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
          Commercial-intent landing pages targeting how US customers search —
          near me, hire, affordable, agency, and industry phrases.{" "}
          {ALL_USA_KEYWORD_PAGES.length.toLocaleString()} pages total; each
          generates on demand.
        </p>

        <div className="mt-12 space-y-10">
          {[...groups.entries()].map(([service, intents]) => (
            <div key={service}>
              <h2 className="text-xl font-medium text-ink">
                {service.replace(/-/g, " ")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {intents.map((i) => (
                  <Link
                    key={i.slug}
                    href={intentPath(i.slug)}
                    className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink"
                  >
                    {i.keyword}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-xl font-medium text-ink">
          More USA keywords
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {more.map((i) => (
            <Link
              key={i.slug}
              href={intentPath(i.slug)}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink"
            >
              {i.keyword}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/categories" variant="secondary">
            Browse more packages
          </Button>
        </div>

        <p className="mt-12 text-sm text-muted">
          Also browse{" "}
          <Link href="/us" className="font-semibold text-ink underline">
            US cities
          </Link>{" "}
          and{" "}
          <Link
            href="/us/state/california"
            className="font-semibold text-ink underline"
          >
            state hubs
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
