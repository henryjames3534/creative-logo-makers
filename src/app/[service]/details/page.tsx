import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetails } from "@/components/CategoryDetails";
import {
  BreadcrumbJsonLd,
  ServiceJsonLd,
} from "@/components/seo/JsonLd";
import {
  allServicePaths,
  getCategoryByServicePath,
} from "@/data/serviceRoutes";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ service: string }> };

export function generateStaticParams() {
  return allServicePaths().map((service) => ({ service }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const cat = getCategoryByServicePath(service);
  if (!cat) return { title: "Category" };
  return pageMetadata({
    title: `${cat.productName} — Contests & 1-to-1 Projects`,
    description: cat.longDescription.slice(0, 160),
    path: `/${cat.slug}/details`,
    keywords: [
      cat.productName,
      `${cat.productName} contest`,
      `hire ${cat.productName.toLowerCase()} designer`,
      "Creative Logo Makers",
    ],
  });
}

/** Creative Logo Makers-style URL: /logo-design/details */
export default async function ServiceDetailsPage({ params }: Props) {
  const { service } = await params;
  const cat = getCategoryByServicePath(service);
  if (!cat) notFound();

  return (
    <>
      <ServiceJsonLd
        name={cat.productName}
        description={cat.longDescription}
        path={`/${cat.slug}/details`}
        price={cat.startingPrice}
      />
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
