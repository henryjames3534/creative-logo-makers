import type { MetadataRoute } from "next";
import {
  SITEMAP_CHUNK_SIZE,
  buildAllSeoSitemapEntries,
} from "@/lib/seo-sitemaps";

/**
 * Split ~8k SEO URLs into multiple sitemaps so crawlers discover them faster.
 * Served as /sitemap.xml (index) + /sitemap/[id].xml
 */
export async function generateSitemaps() {
  const total = buildAllSeoSitemapEntries().length;
  const chunks = Math.max(1, Math.ceil(total / SITEMAP_CHUNK_SIZE));
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<number | string>;
}): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id;
  const id = Number(rawId);
  const all = buildAllSeoSitemapEntries();
  const start = id * SITEMAP_CHUNK_SIZE;
  return all.slice(start, start + SITEMAP_CHUNK_SIZE);
}
