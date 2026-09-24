import { categories, legacySlugMap, type Category } from "@/data/categories";

/**
 * Public path → category slug.
 * Includes 99d pricing slugs, friendly aliases, and legacy internal names.
 */
export const servicePaths: Record<string, string> = {
  // Legacy internals
  ...legacySlugMap,
  // Friendly aliases
  "website-design": "web-design",
  "web-page-design": "web-design",
  "packaging-design": "product-packaging-design",
  "illustration-design": "illustrations",
  "social-media-design": "social-media-page-design",
  "brand-guide": "logo-brand-guide",
  "business-card": "business-card-design",
  "business-advertising": "business-card-design",
  "art-illustration": "illustrations",
  // Renamed / pack aliases from older catalog
  "brand-identity-pack": "brand-launch-pack",
  "logo-business-card-design": "business-card-design",
  "social-media-pack": "brand-starter-pack",
};

// Every category slug is its own public path
for (const c of categories) {
  servicePaths[c.slug] = c.slug;
}

/** slug → primary public path (99d style) */
export const slugToPath: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.slug]),
);

export function getCategoryByServicePath(path: string): Category | undefined {
  const slug =
    servicePaths[path] ??
    (categories.some((c) => c.slug === path) ? path : undefined);
  if (!slug) return undefined;
  return categories.find((c) => c.slug === slug);
}

export function categoryPath(cat: Category | string): string {
  const slug = typeof cat === "string" ? cat : cat.slug;
  return slugToPath[slug] ?? legacySlugMap[slug] ?? slug;
}

export function categoryDetailsHref(cat: Category | string): string {
  return `/${categoryPath(cat)}/details`;
}

export function categoryLaunchHref(
  cat: Category | string,
  packageId = "gold",
  opts?: { designerId?: string; hireMode?: "contest" | "direct" },
): string {
  const base = `/launch/${categoryPath(cat)}?package=${encodeURIComponent(packageId)}`;
  if (opts?.hireMode === "direct" && opts.designerId) {
    return `${base}&hire=direct&designer=${encodeURIComponent(opts.designerId)}`;
  }
  return base;
}

export function allServicePaths(): string[] {
  return categories.map((c) => c.slug);
}
