import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { designers } from "@/data/designers";
import { studioServices } from "@/data/studio";
import { SITE_URL } from "@/lib/seo";

const now = new Date();

function entry(
  path: string,
  opts?: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: opts?.lastModified ?? now,
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.7,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/categories", { priority: 0.95 }),
    entry("/how-it-works", { priority: 0.85 }),
    entry("/pricing", { priority: 0.9 }),
    entry("/contests", { priority: 0.9 }),
    entry("/projects", { priority: 0.85 }),
    entry("/get-started", { priority: 0.95 }),
    entry("/logo-maker", { priority: 0.9 }),
    entry("/inspiration", { priority: 0.8 }),
    entry("/designers", { priority: 0.8 }),
    entry("/designers/search", { priority: 0.85 }),
    entry("/studio", { priority: 0.9 }),
    entry("/about", { priority: 0.7 }),
    entry("/contact", { priority: 0.75 }),
    entry("/terms", { priority: 0.3, changeFrequency: "yearly" }),
    entry("/privacy", { priority: 0.3, changeFrequency: "yearly" }),
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
    return entry(`/${c.slug}/details`, {
      changeFrequency: "weekly",
      priority: boost,
    });
  });

  const launchPages = categories.map((c) =>
    entry(`/launch/${c.slug}`, {
      changeFrequency: "weekly",
      priority: 0.65,
    }),
  );

  const studioPages = studioServices.map((s) =>
    entry(`/studio/${s.slug}`, { priority: 0.8 }),
  );

  // Cap designer URLs so sitemap stays crawl-friendly
  const designerPages = [...designers]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 200)
    .map((d) =>
      entry(`/designers/${d.id}`, {
        changeFrequency: "weekly",
        priority: 0.55,
      }),
    );

  return [
    ...staticPages,
    ...servicePages,
    ...launchPages,
    ...studioPages,
    ...designerPages,
  ];
}
