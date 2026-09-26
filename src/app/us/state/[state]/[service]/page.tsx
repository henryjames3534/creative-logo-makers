import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import { LocalizedFromPrice } from "@/components/locale/LocalizedPrice";
import { Container } from "@/components/Section";
import { categoryLaunchHref } from "@/data/serviceRoutes";
import { US_CITIES, locationPath } from "@/data/us-locations";
import {
  US_STATES,
  getStateBySlug,
  isStateService,
  priorityStateServiceParams,
  statePath,
  stateServicePath,
} from "@/data/us-states";
import { buildStateServiceSeo } from "@/lib/state-seo";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ state: string; service: string }> };

export const revalidate = 86400;
export const dynamicParams = true;

/** Hot services × all states at build; remaining combos on-demand ISR */
export function generateStaticParams() {
  return priorityStateServiceParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, service } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state || !isStateService(service)) return { title: "State service" };
  const seo = buildStateServiceSeo(state, service);
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: stateServicePath(state.slug, service),
    keywords: seo.keywords,
  });
}

export default async function StateServicePage({ params }: Props) {
  const { state: stateSlug, service } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state || !isStateService(service)) notFound();
  const seo = buildStateServiceSeo(state, service);
  const cities = US_CITIES.filter((c) => c.state === state.code).slice(0, 12);
  const moreStates = US_STATES.filter((s) => s.slug !== state.slug).slice(0, 10);

  return (
    <>
      <ServiceJsonLd
        name={seo.primary}
        description={seo.description}
        path={stateServicePath(state.slug, service)}
        price={seo.price}
      />
      <FaqJsonLd faqs={seo.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "United States", path: "/us" },
          { name: state.name, path: statePath(state.slug) },
          {
            name: seo.label,
            path: stateServicePath(state.slug, service),
          },
        ]}
      />

      <section className="border-b border-line bg-paper-soft">
        <Container className="py-12 md:py-16">
          <nav className="text-sm text-muted">
            <Link href="/us" className="hover:text-ink">
              United States
            </Link>
            <span className="mx-2">/</span>
            <Link href={statePath(state.slug)} className="hover:text-ink">
              {state.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{seo.label}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
            {seo.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            {seo.intro}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-ink">
              <LocalizedFromPrice amount={seo.price} prefix="From" />
            </span>
            <span className="text-muted">·</span>
            <span className="text-muted">
              Serving {state.name} remotely nationwide
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={
                seo.cat
                  ? categoryLaunchHref(seo.cat, "gold")
                  : `/launch/${service}`
              }
              variant="primary"
            >
              Start a contest
            </Button>
            <Button href={`/${service}/details`} variant="secondary">
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
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            Why {state.name} businesses choose Creative Logo Makers
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {seo.why.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-line bg-white p-5 text-[15px] leading-relaxed text-ink/80 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-14 text-2xl font-medium text-ink">
            Industries in {state.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {seo.industries.map((i) => (
              <span
                key={i}
                className="rounded-full border border-line bg-paper-soft px-4 py-2 text-sm text-ink"
              >
                {i}
              </span>
            ))}
          </div>

          <h2 className="mt-14 text-2xl font-medium text-ink">
            {seo.label} FAQs — {state.name}
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {seo.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-white px-5 py-1 shadow-sm open:shadow-md"
              >
                <summary className="cursor-pointer list-none py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="border-t border-line pb-4 pt-3 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {cities.length > 0 && (
            <>
              <h2 className="mt-14 text-2xl font-medium text-ink">
                {seo.label} by city in {state.name}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {cities.map((c) => (
                  <Link
                    key={c.slug}
                    href={locationPath(c.slug, service)}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-14 text-2xl font-medium text-ink">
            More states
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {moreStates.map((s) => (
              <Link
                key={s.slug}
                href={stateServicePath(s.slug, service)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
