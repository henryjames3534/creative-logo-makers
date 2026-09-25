import type { Metadata } from "next";
import { CategoriesBrowse } from "@/components/CategoriesBrowse";
import { CtaBand } from "@/components/CtaBand";
import {
  type CategoryGroup,
} from "@/data/categories";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("categories", "/categories");

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
