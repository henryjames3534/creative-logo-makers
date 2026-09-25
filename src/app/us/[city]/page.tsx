import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/Section";
import { getCategory } from "@/data/categories";
import {
  LOCATION_SEO_SERVICES,
  US_CITIES,
  cityPath,
  getCityBySlug,
  locationPath,
} from "@/data/us-locations";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return US_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return { title: "City" };
  return pageMetadata({
    title: `Design Services in ${city.name}, ${city.state} — Logo, Web & App Design`,
    description: `Hire designers for logo design, website design, and mobile app design in ${city.name}, ${city.stateName}. Contests and 1-to-1 projects with Creative Logo Makers.`,
    path: cityPath(city.slug),
    keywords: [
      `logo design ${city.name}`,
      `website design ${city.name}`,
      `graphic design ${city.name}`,
      `hire designer ${city.name}`,
      `${city.name} design services`,
    ],
  });
}

export default async function CityHubPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "United States", path: "/us" },
          { name: city.name, path: cityPath(city.slug) },
        ]}
      />
      <section className="border-b border-line bg-paper-soft">
        <Container className="py-12 md:py-16">
          <nav className="text-sm text-muted">
            <Link href="/us" className="hover:text-ink">
              United States
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{city.name}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-ink md:text-5xl">
            Design services in {city.name}, {city.state}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            Creative Logo Makers serves {city.name} businesses with logo design,
            website design, mobile app UI, packaging, and branding — via contest
            or 1-to-1 hire, delivered remotely across {city.stateName}.
          </p>
          <div className="mt-8">
            <Button href="/get-started" variant="primary">
              Get started
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <h2 className="text-2xl font-medium text-ink">
            Popular services in {city.name}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATION_SEO_SERVICES.map((slug) => {
              const cat = getCategory(slug);
              return (
                <Link
                  key={slug}
                  href={locationPath(city.slug, slug)}
                  className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-ink"
                >
                  <h3 className="font-semibold text-ink">
                    {cat?.productName || slug.replace(/-/g, " ")} in {city.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {cat?.description ||
                      `Professional ${slug.replace(/-/g, " ")} for ${city.name} brands.`}
                  </p>
                  <p className="mt-3 text-sm font-bold text-ink">
                    From {cat?.startingPrice || "$249"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
