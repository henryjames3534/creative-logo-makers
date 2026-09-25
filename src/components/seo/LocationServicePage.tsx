import Link from "next/link";
import { Button } from "@/components/Button";
import { LocalizedFromPrice } from "@/components/locale/LocalizedPrice";
import { Container } from "@/components/Section";
import { categoryLaunchHref } from "@/data/serviceRoutes";
import {
  LOCATION_SEO_SERVICES,
  US_CITIES,
  cityPath,
  locationPath,
  type UsCity,
} from "@/data/us-locations";
import { buildLocationSeo } from "@/lib/location-seo";
import { getCategory } from "@/data/categories";

export function LocationServicePage({
  city,
  serviceSlug,
}: {
  city: UsCity;
  serviceSlug: string;
}) {
  const seo = buildLocationSeo(city, serviceSlug);
  const relatedCities = US_CITIES.filter((c) => c.slug !== city.slug)
    .filter((c) => c.state === city.state || c.region === city.region)
    .slice(0, 8);
  const moreCities = US_CITIES.filter((c) => c.slug !== city.slug).slice(0, 12);
  const relatedServices = LOCATION_SEO_SERVICES.filter((s) => s !== serviceSlug)
    .slice(0, 8)
    .map((s) => ({
      slug: s,
      name: getCategory(s)?.productName || s.replace(/-/g, " "),
    }));

  return (
    <>
      <section className="border-b border-line bg-paper-soft">
        <Container className="py-12 md:py-16">
          <nav className="text-sm text-muted">
            <Link href="/us" className="hover:text-ink">
              United States
            </Link>
            <span className="mx-2">/</span>
            <Link href={cityPath(city.slug)} className="hover:text-ink">
              {city.name}
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
              Serving {city.name}, {city.stateName} remotely nationwide
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={
                seo.cat
                  ? categoryLaunchHref(seo.cat, "gold")
                  : `/launch/${serviceSlug}`
              }
              variant="primary"
            >
              Start a contest
            </Button>
            <Button href={`/${serviceSlug}/details`} variant="secondary">
              View packages
            </Button>
            <Button href="/projects" variant="secondary">
              Hire 1-to-1
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            Why {city.name} businesses choose Creative Logo Makers
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
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14 md:py-16">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            How {seo.cluster.primary} works for {city.name}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Brief",
                d: `Share your ${city.name} brand goals, audience, and style references.`,
              },
              {
                n: "02",
                t: "Concepts",
                d: "Designers submit custom options you can compare side by side.",
              },
              {
                n: "03",
                t: "Files",
                d: "Pick a winner, request revisions, and download production-ready assets.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  {step.n}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container>
          <h2 className="text-3xl font-medium tracking-tight text-ink">
            {seo.label} FAQs for {city.name}
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {seo.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-white px-5 py-1 shadow-sm open:shadow-md"
              >
                <summary className="cursor-pointer list-none py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="border-t border-line pb-4 pt-3 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-paper-soft py-14">
        <Container>
          <h2 className="text-2xl font-medium text-ink">
            More services in {city.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {relatedServices.map((s) => (
              <Link
                key={s.slug}
                href={locationPath(city.slug, s.slug)}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {s.name}
              </Link>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-medium text-ink">
            {seo.label} in nearby &amp; related cities
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {(relatedCities.length ? relatedCities : moreCities).map((c) => (
              <Link
                key={c.slug}
                href={locationPath(c.slug, serviceSlug)}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink"
              >
                {c.name}, {c.state}
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            <Link href={cityPath(city.slug)} className="font-semibold text-ink underline">
              All design services in {city.name}
            </Link>
            {" · "}
            <Link href="/us" className="font-semibold text-ink underline">
              Browse all US cities
            </Link>
          </p>
        </Container>
      </section>

      <section className="border-t border-line bg-ink py-12">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-semibold !text-white">
              Ready for {seo.cluster.primary} in {city.name}?
            </p>
            <p className="mt-1 text-sm !text-white/70">
              Launch a contest today — designers start submitting concepts fast.
            </p>
          </div>
          <Button
            href={
              seo.cat
                ? categoryLaunchHref(seo.cat, "gold")
                : `/get-started`
            }
            variant="primary"
          >
            Get started
          </Button>
        </Container>
      </section>
    </>
  );
}
