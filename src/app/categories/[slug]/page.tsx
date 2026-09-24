import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { categories, getCategory } from "@/data/categories";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Category" };
  // Canonical lives at /{slug}/details — keep metadata aligned
  return pageMetadata({
    title: `${cat.productName} — Contests & 1-to-1 Projects`,
    description: cat.longDescription.slice(0, 160),
    path: `/${cat.slug}/details`,
  });
}

/** Legacy /categories/[slug] → canonical /[slug]/details */
export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();
  permanentRedirect(`/${cat.slug}/details`);
}
