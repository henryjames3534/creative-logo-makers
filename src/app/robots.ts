import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/designer",
          "/designer/",
          "/login",
          "/signup",
          "/api/",
        ],
      },
    ],
    // Full SEO sitemap (robots disallow /api/, so keep discovery here)
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Host must be bare hostname (no protocol) for crawlers that still read it
    host: "www.creativelogomakers.com",
  };
}
