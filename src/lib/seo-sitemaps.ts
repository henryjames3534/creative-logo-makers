import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { designers } from "@/data/designers";
import { studioServices } from "@/data/studio";
import {
  ALL_USA_KEYWORD_PAGES,
  USA_INTENTS,
  intentPath,
} from "@/data/usa-intents";
import {
  LOCATION_SEO_SERVICES,
  US_CITIES,
  cityPath,
  locationPath,
} from "@/data/us-locations";
import {
  STATE_SEO_SERVICES,
  US_STATES,
  statePath,
  stateServicePath,
} from "@/data/us-states";
import { getPublishedBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const SITEMAP_CHUNK_SIZE = 2000;

function entry(
  path: string,
  opts?: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    lastModified?: Date;
  },
  generatedAt?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: opts?.lastModified ?? generatedAt ?? new Date(),
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.7,
  };
}

/** Full public SEO URL set for sitemap + IndexNow. */
export function buildAllSeoSitemapEntries(
  generatedAt = new Date(),
): MetadataRoute.Sitemap {
  const now = generatedAt;

  const staticPages: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1 }, now),
    entry("/us", { changeFrequency: "weekly", priority: 0.95 }, now),
    entry("/usa", { changeFrequency: "weekly", priority: 0.95 }, now),
    entry("/categories", { priority: 0.95 }, now),
    entry("/how-it-works", { priority: 0.85 }, now),
    entry("/pricing", { priority: 0.9 }, now),
    entry("/contests", { priority: 0.9 }, now),
    entry("/projects", { priority: 0.85 }, now),
    entry("/get-started", { priority: 0.95 }, now),
    entry("/logo-maker", { priority: 0.9 }, now),
    entry("/inspiration", { priority: 0.8 }, now),
    entry("/blog", { changeFrequency: "daily", priority: 0.9 }, now),
    entry("/designers", { priority: 0.8 }, now),
    entry("/designers/search", { priority: 0.85 }, now),
    entry("/studio", { priority: 0.9 }, now),
    entry("/about", { priority: 0.7 }, now),
    entry("/contact", { priority: 0.75 }, now),
    entry("/terms", { priority: 0.3, changeFrequency: "yearly" }, now),
    entry("/privacy", { priority: 0.3, changeFrequency: "yearly" }, now),
  ];

  const servicePages = categories.map((c) => {
    const boost =
      c.slug === "logo-design" ||
      c.slug === "web-design" ||
      c.slug === "mobile-app-design"
        ? 0.99
        : c.popular
          ? 0.92
          : 0.75;
    return entry(
      `/${c.slug}/details`,
      { changeFrequency: "weekly", priority: boost },
      now,
    );
  });

  const launchPages = categories.map((c) =>
    entry(
      `/launch/${c.slug}`,
      { changeFrequency: "weekly", priority: 0.65 },
      now,
    ),
  );

  const studioPages = studioServices.map((s) =>
    entry(`/studio/${s.slug}`, { priority: 0.8 }, now),
  );

  const cityHubs = US_CITIES.map((c) =>
    entry(cityPath(c.slug), { priority: 0.8, changeFrequency: "weekly" }, now),
  );

  const locationPages = US_CITIES.flatMap((city) =>
    LOCATION_SEO_SERVICES.map((service) => {
      const hot =
        service === "logo-design" ||
        service === "web-design" ||
        service === "mobile-app-design";
      return entry(
        locationPath(city.slug, service),
        { priority: hot ? 0.88 : 0.72, changeFrequency: "weekly" },
        now,
      );
    }),
  );

  const stateHubs = US_STATES.map((s) =>
    entry(statePath(s.slug), { priority: 0.85, changeFrequency: "weekly" }, now),
  );

  const stateServicePages = US_STATES.flatMap((state) =>
    STATE_SEO_SERVICES.map((service) => {
      const hot =
        service === "logo-design" ||
        service === "web-design" ||
        service === "mobile-app-design";
      return entry(
        stateServicePath(state.slug, service),
        { priority: hot ? 0.9 : 0.75, changeFrequency: "weekly" },
        now,
      );
    }),
  );

  const featuredSlugs = new Set(USA_INTENTS.map((i) => i.slug));

  const intentPages = ALL_USA_KEYWORD_PAGES.map((i) =>
    entry(
      intentPath(i.slug),
      {
        priority: featuredSlugs.has(i.slug)
          ? 0.92
          : i.source === "gsc"
            ? 0.88
            : 0.7,
        changeFrequency: "weekly",
      },
      now,
    ),
  );

  const designerPages = [...designers]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 200)
    .map((d) =>
      entry(
        `/designers/${d.id}`,
        { changeFrequency: "weekly", priority: 0.55 },
        now,
      ),
    );

  const blogPages = getPublishedBlogPosts(now).map((p) =>
    entry(
      `/blog/${p.slug}`,
      {
        changeFrequency: "monthly",
        priority: 0.86,
        lastModified: new Date(p.publishAt),
      },
      now,
    ),
  );

  return [
    ...staticPages,
    ...servicePages,
    ...launchPages,
    ...studioPages,
    ...cityHubs,
    ...locationPages,
    ...stateHubs,
    ...stateServicePages,
    ...intentPages,
    ...designerPages,
    ...blogPages,
  ];
}

export function listAllSeoUrls(): string[] {
  return buildAllSeoSitemapEntries().map((e) => e.url);
}

/** High-priority URLs to push first for indexing. */
export function listPrioritySeoUrls(): string[] {
  const featured = USA_INTENTS.map((i) => `${SITE_URL}${intentPath(i.slug)}`);
  const core = [
    `${SITE_URL}/`,
    `${SITE_URL}/usa`,
    `${SITE_URL}/us`,
    `${SITE_URL}/pricing`,
    `${SITE_URL}/get-started`,
    `${SITE_URL}/categories`,
    `${SITE_URL}/contests`,
    `${SITE_URL}/logo-design/details`,
    `${SITE_URL}/web-design/details`,
    `${SITE_URL}/mobile-app-design/details`,
    `${SITE_URL}/product-packaging-design/details`,
    `${SITE_URL}/t-shirt-design/details`,
    `${SITE_URL}/blog`,
    ...getPublishedBlogPosts().map((p) => `${SITE_URL}/blog/${p.slug}`),
  ];
  return Array.from(new Set([...core, ...featured]));
}
