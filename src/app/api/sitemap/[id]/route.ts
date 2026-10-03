import { NextResponse } from "next/server";
import {
  SITEMAP_CHUNK_SIZE,
  buildAllSeoSitemapEntries,
} from "@/lib/seo-sitemaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Chunked sitemap: /api/sitemap/0 … for sitemap-index. */
export async function GET(_req: Request, ctx: Ctx) {
  const { id: raw } = await ctx.params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const all = buildAllSeoSitemapEntries();
  const slice = all.slice(id * SITEMAP_CHUNK_SIZE, (id + 1) * SITEMAP_CHUNK_SIZE);
  if (!slice.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const urls = slice
    .map((e) => {
      const lastmod =
        e.lastModified instanceof Date
          ? e.lastModified.toISOString()
          : e.lastModified
            ? new Date(e.lastModified).toISOString()
            : new Date().toISOString();
      return `  <url>
    <loc>${e.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changeFrequency || "weekly"}</changefreq>
    <priority>${e.priority ?? 0.7}</priority>
  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
