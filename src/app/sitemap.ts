import type { MetadataRoute } from "next";
import { buildAllSeoSitemapEntries } from "@/lib/seo-sitemaps";

/** Single sitemap.xml for Google/Bing discovery (~8k SEO URLs). */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildAllSeoSitemapEntries();
}
