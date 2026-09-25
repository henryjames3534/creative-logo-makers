import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetails } from "@/components/CategoryDetails";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import {
  allServicePaths,
  getCategoryByServicePath,
} from "@/data/serviceRoutes";
import { getUsaSeoForSlug } from "@/data/usa-seo-keywords";
import { servicePageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return allServicePaths().map((service) => ({ service }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const cat = getCategoryByServicePath(service);
  if (!cat) return { title: "Category" };
  return servicePageMetadata(cat.slug, `/${cat.slug}/details`);
}

/** Creative Logo Makers-style URL: /logo-design/details */
export default async function ServiceDetailsPage({ params }: Props) {
  const { service } = await params;
  const cat = getCategoryByServicePath(service);
  if (!cat) notFound();
  const seo = getUsaSeoForSlug(cat.slug);

  return (
    <>
      <ServiceJsonLd
        name={seo.primary}
        description={seo.description}
        path={`/${cat.slug}/details`}
        price={cat.startingPrice}
      />
      <FaqJsonLd faqs={seo.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Categories", path: "/categories" },
          { name: cat.productName, path: `/${cat.slug}/details` },
        ]}
      />
      <CategoryDetails cat={cat} />
    </>
  );
}
