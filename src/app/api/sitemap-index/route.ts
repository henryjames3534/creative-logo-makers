import { NextResponse } from "next/server";
import {
  SITEMAP_CHUNK_SIZE,
  buildAllSeoSitemapEntries,
} from "@/lib/seo-sitemaps";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Extra sitemap index for crawlers that prefer chunks.
 * Primary discovery remains /sitemap.xml (robots.txt).
 */
export async function GET() {
  const total = buildAllSeoSitemapEntries().length;
  const chunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: chunks }, (_, id) => `  <sitemap>
    <loc>${SITE_URL}/api/sitemap/${id}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
