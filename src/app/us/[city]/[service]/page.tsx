import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationServicePage } from "@/components/seo/LocationServicePage";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import {
  getCityBySlug,
  isLocationService,
  locationPath,
  priorityLocationParams,
} from "@/data/us-locations";
import { buildLocationSeo } from "@/lib/location-seo";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ city: string; service: string }> };

/** Cache on-demand pages for 24h after first generate */
export const revalidate = 86400;
export const dynamicParams = true;

/** Only top city × hot services at build; sitemap still has all URLs */
export function generateStaticParams() {
  return priorityLocationParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, service } = await params;
  const city = getCityBySlug(citySlug);
  if (!city || !isLocationService(service)) return { title: "Location" };
  const seo = buildLocationSeo(city, service);
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: locationPath(city.slug, service),
    keywords: seo.keywords,
  });
}

export default async function UsCityServicePage({ params }: Props) {
  const { city: citySlug, service } = await params;
  const city = getCityBySlug(citySlug);
  if (!city || !isLocationService(service)) notFound();
  const seo = buildLocationSeo(city, service);

  return (
    <>
      <ServiceJsonLd
        name={seo.primary}
        description={seo.description}
        path={locationPath(city.slug, service)}
        price={seo.price}
      />
      <FaqJsonLd faqs={seo.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "United States", path: "/us" },
          { name: city.name, path: `/us/${city.slug}` },
          {
            name: seo.label,
            path: locationPath(city.slug, service),
          },
        ]}
      />
      <LocationServicePage city={city} serviceSlug={service} />
    </>
  );
}
