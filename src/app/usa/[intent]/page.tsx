import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import { UsaBasicPackagesGrid } from "@/components/seo/UsaBasicPackagesGrid";
import { Container } from "@/components/Section";
import { getCategory } from "@/data/categories";
import { categoryLaunchHref } from "@/data/serviceRoutes";
import {
  GSC_PRIORITY_SLUGS,
  getIntentBySlug,
  intentPath,
  relatedUsaKeywords,
} from "@/data/usa-intents";
import { US_CITIES, locationPath } from "@/data/us-locations";
import { US_STATES, stateServicePath } from "@/data/us-states";
import { getUsaSeoForSlug } from "@/data/usa-seo-keywords";
import { pageMetadata } from "@/lib/seo";
import { buildUsaKeywordCopy } from "@/lib/usa-keyword-copy";

type Props = { params: Promise<{ intent: string }> };

/** Keyword pages generate on first request — keep build light. */
export const dynamicParams = true;
export const revalidate = 86400;

/** Prebuild GSC money-keyword pages so Google can crawl strong HTML immediately. */
export function generateStaticParams() {
  return GSC_PRIORITY_SLUGS.map((intent) => ({ intent }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { intent: slug } = await params;
  const intent = getIntentBySlug(slug);
  if (!intent) return { title: "USA design" };
  return pageMetadata({
    title: intent.title,
    description: intent.description,
    path: intentPath(intent.slug),
    keywords: [intent.keyword, ...intent.related, `${intent.keyword} USA`],
  });
}

export default async function UsaIntentPage({ params }: Props) {
  const { intent: slug } = await params;
  const intent = getIntentBySlug(slug);
  if (!intent) notFound();

  const cat = getCategory(intent.serviceSlug);
  const cluster = getUsaSeoForSlug(intent.serviceSlug);
  const price = cat?.startingPrice || "$125";
  const productName = cat?.productName || cluster.primary;
  const copy = buildUsaKeywordCopy(intent, price, productName);
  const topCities = US_CITIES.slice(0, 18);
  const topStates = US_STATES.filter((s) =>
    ["CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI"].includes(s.code),
  );
  const related = relatedUsaKeywords(intent.slug, 12);
  const isGscPriority = (GSC_PRIORITY_SLUGS as readonly string[]).includes(
    intent.slug,
  );

  return (
    <>
      <ServiceJsonLd
        name={intent.keyword}
        description={intent.description}
        path={intentPath(intent.slug)}
        price={price}
      />
      <FaqJsonLd faqs={copy.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "USA keywords", path: "/usa" },
          { name: intent.keyword, path: intentPath(intent.slug) },
        ]}
      />

      <section className="border-b border-line bg-paper-soft">
        <Container className="py-12 md:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
            USA ranking keyword
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
            {intent.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            {intent.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={cat ? categoryLaunchHref(cat, "bronze") : "/get-started"}
              variant="primary"
            >
              Start a contest
            </Button>
            <Button href={`/${intent.serviceSlug}/details`} variant="secondary">
              View packages
            </Button>
            <Button href="/projects" variant="secondary">
              Hire 1-to-1
            </Button>
          </div>
        </Container>
      </section>

      <UsaBasicPackagesGrid highlightSlug={intent.serviceSlug} limit={12} />

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-medium text-ink">Why this page exists</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75">
            {copy.intro}
          </p>
          <ul className="mt-6 max-w-2xl space-y-2 text-ink">
            {copy.bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>

          <h2 className="mt-14 text-2xl font-medium text-ink">How it works</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75">
            {copy.howItWorks}
          </p>

          {isGscPriority ? (
            <div className="mt-14 rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-medium text-ink">
                What buyers mean by “{intent.keyword}”
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75">
                People searching <strong>{intent.keyword}</strong> usually want
                a clear US vendor, fixed pricing, and proof they will own the
                final files — not a vague proposal. Creative Logo Makers answers
                that with contest packages (many concepts) or 1-to-1 hire, plus
                Studio when you need a fuller brand system.
              </p>
              <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-ink/80">
                <li>
                  Exact-match landing for <strong>{intent.keyword}</strong> with
                  packages, FAQs, and city/state links
                </li>
                <li>
                  Deep link to{" "}
                  <Link
                    href={`/${intent.serviceSlug}/details`}
                    className="font-semibold text-hero hover:underline"
                  >
                    {productName} packages
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/case-studies"
                    className="font-semibold text-hero hover:underline"
                  >
                    case studies
                  </Link>
                </li>
                <li>
                  Supporting proof via{" "}
                  <Link
                    href="/testimonials"
                    className="font-semibold text-hero hover:underline"
                  >
                    testimonials
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/process"
                    className="font-semibold text-hero hover:underline"
                  >
                    our process
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}

          <h2 className="mt-14 text-2xl font-medium text-ink">Related searches</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {[intent.keyword, ...intent.related].map((k) => (
              <span
                key={k}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
              >
                {k}
              </span>
            ))}
          </div>

          <h2 className="mt-14 text-2xl font-medium text-ink">
            {productName} by US city
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {topCities.map((c) => (
              <Link
                key={c.slug}
                href={locationPath(c.slug, intent.serviceSlug)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/us" className="text-sm font-semibold text-ink underline">
              Browse more cities →
            </Link>
          </div>

          <h2 className="mt-14 text-2xl font-medium text-ink">
            {productName} by state
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {topStates.map((s) => (
              <Link
                key={s.slug}
                href={stateServicePath(s.slug, intent.serviceSlug)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {s.name}
              </Link>
            ))}
          </div>

          <h2 className="mt-14 text-2xl font-medium text-ink">
            Related USA keywords
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {related.map((i) => (
              <Link
                key={i.slug}
                href={intentPath(i.slug)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {i.keyword}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/usa" className="text-sm font-semibold text-ink underline">
              Browse more USA keywords →
            </Link>
          </div>

          <h2 className="mt-14 text-2xl font-medium text-ink">FAQs</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {copy.faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-line bg-white px-5 py-1 shadow-sm"
              >
                <summary className="cursor-pointer list-none py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="border-t border-line pb-4 pt-3 text-sm text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
