import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { getCategory } from "@/data/categories";
import {
  LOCATION_SEO_SERVICES,
  US_CITIES,
  cityPath,
  locationPath,
} from "@/data/us-locations";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Design Services Across the USA — Logo, Web & App Design by City",
  description:
    "Find logo design, website design, and mobile app design for every major US city. Creative Logo Makers contests and 1-to-1 projects — nationwide remote delivery.",
  path: "/us",
  keywords: [
    "logo design USA",
    "website design USA",
    "mobile app design USA",
    "graphic design by city",
    "hire designer United States",
  ],
});

export default function UsHubPage() {
  const regions = [...new Set(US_CITIES.map((c) => c.region))];

  return (
    <>
      <section className="border-b border-line bg-paper-soft">
        <Container className="py-14 md:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green">
            United States coverage
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Design services in every major US city
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            Rank-ready pages for logo design, website design, mobile app design,
            and more — tailored for businesses across the United States. Pick
            your city to see local landing pages.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/logo-design/details" variant="primary">
              Logo design
            </Button>
            <Button href="/web-design/details" variant="secondary">
              Website design
            </Button>
            <Button href="/mobile-app-design/details" variant="secondary">
              Mobile app design
            </Button>
          </div>
        </Container>
      </section>

      {regions.map((region) => (
        <section key={region} className="border-b border-line py-12">
          <Container>
            <h2 className="text-2xl font-medium text-ink">{region}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {US_CITIES.filter((c) => c.region === region).map((city) => (
                <Link
                  key={city.slug}
                  href={cityPath(city.slug)}
                  className="rounded-2xl border border-line bg-white px-4 py-4 shadow-sm transition hover:border-ink"
                >
                  <p className="font-semibold text-ink">
                    {city.name}, {city.state}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {LOCATION_SEO_SERVICES.length} design services
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-medium text-ink">
            Popular US keyword pages
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {["new-york", "los-angeles", "chicago", "houston", "miami", "dallas"]
              .flatMap((city) =>
                (["logo-design", "web-design", "mobile-app-design"] as const).map(
                  (service) => {
                    const label = getCategory(service)?.productName || service;
                    const cityName =
                      US_CITIES.find((c) => c.slug === city)?.name || city;
                    return (
                      <Link
                        key={`${city}-${service}`}
                        href={locationPath(city, service)}
                        className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink"
                      >
                        {label} in {cityName}
                      </Link>
                    );
                  },
                ),
              )}
          </div>
        </Container>
      </section>
    </>
  );
}
