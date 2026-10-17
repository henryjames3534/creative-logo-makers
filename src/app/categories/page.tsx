import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesBrowse } from "@/components/CategoriesBrowse";
import { CtaBand } from "@/components/CtaBand";
import { pillarPageMetadata } from "@/lib/seo";

export const metadata: Metadata = pillarPageMetadata("categories", "/categories");

/** Static HTML for crawl — query filters (?q / ?group) apply client-side. */
export const revalidate = 86400;

export default function CategoriesPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CategoriesBrowse />
      </Suspense>
      <CtaBand />
    </>
  );
}
