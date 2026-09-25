import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { getCategory } from "@/data/categories";
import { categoryLaunchHref } from "@/data/serviceRoutes";
import {
  USA_INTENTS,
  getIntentBySlug,
  intentPath,
} from "@/data/usa-intents";
import { US_CITIES, locationPath } from "@/data/us-locations";
import { US_STATES, stateServicePath } from "@/data/us-states";
import { getUsaSeoForSlug } from "@/data/usa-seo-keywords";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ intent: string }> };

export function generateStaticParams() {
  return USA_INTENTS.map((i) => ({ intent: i.slug }));
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
  const price = cat?.startingPrice || "$249";
  const topCities = US_CITIES.slice(0, 18);
  const topStates = US_STATES.filter((s) =>
    ["CA", "TX", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "MI"].includes(s.code),
  );
  const relatedIntents = USA_INTENTS.filter(
    (i) => i.slug !== intent.slug && i.serviceSlug === intent.serviceSlug,
  ).slice(0, 8);

  const faqs = [
    {
      question: `What is the best way to get ${intent.keyword} in the USA?`,
      answer: `Launch a Creative Logo Makers contest for multiple custom concepts, or hire one designer 1-to-1. Both paths include revisions and commercial ownership of final files.`,
    },
    {
      question: `How much does ${intent.keyword} cost?`,
      answer: `${cat?.productName || cluster.primary} packages start from ${price}. Higher tiers add more concepts and revision rounds for US businesses.`,
    },
    {
      question: `Do I need a local agency for ${intent.keyword}?`,
      answer: `Not necessarily. Remote contests reach vetted designers across the USA while keeping USD pricing and English support — ideal when searching “${intent.keyword}” online.`,
    },
    {
      question: `How fast can I start?`,
      answer: `You can launch today. Most contests begin receiving concepts within a few days once your brief is live.`,
    },
  ];

  return (
    <>
      <ServiceJsonLd
        name={intent.keyword}
        description={intent.description}
        path={intentPath(intent.slug)}
        price={price}
      />
      <FaqJsonLd faqs={faqs} />
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
              href={cat ? categoryLaunchHref(cat, "gold") : "/get-started"}
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

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-medium text-ink">
            Related searches
          </h2>
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
            {cat?.productName || cluster.primary} by US city
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

          <h2 className="mt-14 text-2xl font-medium text-ink">
            {cat?.productName || cluster.primary} by state
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

          {relatedIntents.length > 0 && (
            <>
              <h2 className="mt-14 text-2xl font-medium text-ink">
                Related USA keywords
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {relatedIntents.map((i) => (
                  <Link
                    key={i.slug}
                    href={intentPath(i.slug)}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
                  >
                    {i.keyword}
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-14 text-2xl font-medium text-ink">FAQs</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {faqs.map((faq) => (
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
