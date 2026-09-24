import type { Metadata } from "next";
import { CategoriesBrowse } from "@/components/CategoriesBrowse";
import { CtaBand } from "@/components/CtaBand";
import {
  type CategoryGroup,
} from "@/data/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Design Categories",
  description:
    "Browse all design categories — logos, websites, packaging, merchandise, illustration & more.",
  path: "/categories",
});

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; group?: string }>;
}) {
  const { q, group } = await searchParams;
  const groupFilter = group as CategoryGroup | undefined;

  return (
    <>
      <CategoriesBrowse initialGroup={groupFilter} initialQuery={q ?? ""} />
      <CtaBand />
    </>
  );
}
