import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { designers } from "@/data/designers";
import { studioServices } from "@/data/studio";
import { USA_INTENTS, intentPath } from "@/data/usa-intents";
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
    entry("/us", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/usa", { changeFrequency: "weekly", priority: 0.95 }),
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

  const cityHubs = US_CITIES.map((c) =>
    entry(cityPath(c.slug), { priority: 0.8, changeFrequency: "weekly" }),
  );

  const locationPages = US_CITIES.flatMap((city) =>
    LOCATION_SEO_SERVICES.map((service) => {
      const hot =
        service === "logo-design" ||
        service === "web-design" ||
        service === "mobile-app-design";
      return entry(locationPath(city.slug, service), {
        priority: hot ? 0.88 : 0.72,
        changeFrequency: "weekly",
      });
    }),
  );

  const stateHubs = US_STATES.map((s) =>
    entry(statePath(s.slug), { priority: 0.85, changeFrequency: "weekly" }),
  );

  const stateServicePages = US_STATES.flatMap((state) =>
    STATE_SEO_SERVICES.map((service) => {
      const hot =
        service === "logo-design" ||
        service === "web-design" ||
        service === "mobile-app-design";
      return entry(stateServicePath(state.slug, service), {
        priority: hot ? 0.9 : 0.75,
        changeFrequency: "weekly",
      });
    }),
  );

  const intentPages = USA_INTENTS.map((i) =>
    entry(intentPath(i.slug), { priority: 0.92, changeFrequency: "weekly" }),
  );

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
    ...cityHubs,
    ...locationPages,
    ...stateHubs,
    ...stateServicePages,
    ...intentPages,
    ...designerPages,
  ];
}
