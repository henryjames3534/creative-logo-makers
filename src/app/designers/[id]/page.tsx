import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignerProfileView } from "@/components/DesignerProfileView";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { designers, getDesignerById } from "@/data/designers";
import { designerStartingRate } from "@/lib/designer-rates";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

/** Prebuild a small top set; other profiles render on demand. */
export function generateStaticParams() {
  return [...designers]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 24)
    .map((d) => ({ id: d.id }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d =
    getDesignerById(id) ||
    designers.find(
      (x) => x.handle.toLowerCase() === decodeURIComponent(id).toLowerCase(),
    );
  if (!d) return { title: "Designer" };
  const rate = designerStartingRate(d);
  return pageMetadata({
    title: `${d.name} — Designer (${rate})`,
    description: (d.bio || `${d.name} is a Creative Logo Makers designer.`).slice(
      0,
      160,
    ),
    path: `/designers/${d.id}`,
    image: d.avatar || d.image || undefined,
  });
}

export default async function DesignerProfilePage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const decoded = decodeURIComponent(id);
  const d =
    getDesignerById(decoded) ||
    designers.find(
      (x) =>
        x.handle.toLowerCase() === decoded.toLowerCase() ||
        x.name.toLowerCase() === decoded.toLowerCase(),
    );

  if (!d) notFound();

  const tab =
    sp.tab === "about" || sp.tab === "invite" || sp.tab === "portfolio"
      ? sp.tab
      : "portfolio";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: d.name,
          description: d.bio,
          url: `${SITE_URL}/designers/${d.id}`,
          image: d.avatar || d.image,
          jobTitle: "Designer",
          worksFor: { "@type": "Organization", name: SITE_NAME },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(d.rating),
            reviewCount: String(d.reviews),
            bestRating: "5",
          },
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Designers", path: "/designers/search" },
          { name: d.name, path: `/designers/${d.id}` },
        ]}
      />
      <DesignerProfileView designer={d} initialTab={tab} />
    </>
  );
}
