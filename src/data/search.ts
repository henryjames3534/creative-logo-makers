import { categories, getCategory } from "@/data/categories";
import { categoryDetailsHref } from "@/data/serviceRoutes";

export type SearchSuggestion = {
  label: string;
  href: string;
  keywords: string[];
  /** Short helper line under the title */
  blurb: string;
  /** marketing-icon--* key */
  icon: string;
  /** e.g. "From $75" */
  price?: string;
  group: "service" | "tool" | "hire";
  trending?: boolean;
};

function priceFor(slug: string): string | undefined {
  const cat = getCategory(slug);
  if (!cat?.startingPrice) return undefined;
  return `From ${cat.startingPrice}`;
}

/** Maps free-text search → local category / flow routes */
export const searchSuggestions: SearchSuggestion[] = [
  {
    label: "Logo design",
    href: "/logo-design/details",
    keywords: ["logo", "logos", "logotype", "wordmark", "brand mark"],
    blurb: "Custom marks from dozens of designers",
    icon: "logo-design",
    price: priceFor("logo-design"),
    group: "service",
    trending: true,
  },
  {
    label: "Branding",
    href: "/logo-brand-guide/details",
    keywords: ["brand", "branding", "identity", "brand kit", "brand guide"],
    blurb: "Logo, colors, type & style guide",
    icon: "logo-brand-guide",
    price: priceFor("logo-brand-guide"),
    group: "service",
    trending: true,
  },
  {
    label: "Website design",
    href: "/web-design/details",
    keywords: ["website", "web", "landing", "homepage", "site"],
    blurb: "Landing pages & full site concepts",
    icon: "web-design",
    price: priceFor("web-design"),
    group: "service",
    trending: true,
  },
  {
    label: "App UI design",
    href: "/mobile-app-design/details",
    keywords: ["app", "ui", "ux", "mobile", "dashboard"],
    blurb: "Mobile & product interface screens",
    icon: "mobile-app-design",
    price: priceFor("mobile-app-design"),
    group: "service",
  },
  {
    label: "Business cards",
    href: "/business-card-design/details",
    keywords: ["business card", "cards", "flyer", "poster", "ads", "advertising"],
    blurb: "Print-ready cards that get remembered",
    icon: "business-card-design",
    price: priceFor("business-card-design"),
    group: "service",
  },
  {
    label: "Art & illustration",
    href: "/illustrations/details",
    keywords: ["art", "illustration", "mascot", "character", "drawing"],
    blurb: "Mascots, scenes & custom art",
    icon: "illustrations",
    price: priceFor("illustrations"),
    group: "service",
  },
  {
    label: "Packaging design",
    href: "/product-packaging-design/details",
    keywords: ["packaging", "label", "box", "product packaging", "pouch"],
    blurb: "Shelf-ready packs & labels",
    icon: "product-packaging-design",
    price: priceFor("product-packaging-design"),
    group: "service",
    trending: true,
  },
  {
    label: "Book cover design",
    href: "/book-cover-design/details",
    keywords: ["book", "cover", "ebook", "paperback"],
    blurb: "Covers that sell the story",
    icon: "book-cover-design",
    price: priceFor("book-cover-design"),
    group: "service",
  },
  {
    label: "T-shirt & merchandise",
    href: "/t-shirt-design/details",
    keywords: ["t-shirt", "tshirt", "merch", "hoodie", "apparel"],
    blurb: "Apparel & merch graphics",
    icon: "t-shirt-design",
    price: priceFor("t-shirt-design"),
    group: "service",
  },
  {
    label: "Social media content",
    href: "/social-media-page-design/details",
    keywords: ["social", "instagram", "content", "carousel", "thumbnail"],
    blurb: "Posts, covers & brand kits",
    icon: "social-media-page-design",
    price: priceFor("social-media-page-design"),
    group: "service",
  },
  {
    label: "Free Logo Maker",
    href: "/logo-maker",
    keywords: ["logo maker", "free logo", "make a logo"],
    blurb: "DIY mark in minutes — no card needed",
    icon: "logo-design",
    group: "tool",
  },
  {
    label: "Design contest",
    href: "/contests",
    keywords: ["contest", "competition", "many designers"],
    blurb: "Many designers compete for your brief",
    icon: "brand-identity-pack",
    group: "hire",
  },
  {
    label: "Hire a designer",
    href: "/designers/search",
    keywords: ["hire", "designer", "freelance", "1-to-1", "project"],
    blurb: "1-to-1 project with a vetted creative",
    icon: "brand-guide",
    group: "hire",
  },
];

export const popularSearchLinks = [
  { label: "Logo design", href: "/logo-design/details", query: "Logo design" },
  { label: "Website", href: "/web-design/details", query: "Website design" },
  { label: "Branding", href: "/logo-brand-guide/details", query: "Branding" },
  {
    label: "Packaging",
    href: "/product-packaging-design/details",
    query: "Packaging design",
  },
] as const;

export const searchQuickActions = searchSuggestions.filter(
  (s) => s.group === "tool" || s.group === "hire",
);

export const searchTrending = searchSuggestions.filter((s) => s.trending);

export function resolveSearch(query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return "/get-started";

  const exact = searchSuggestions.find((s) => s.label.toLowerCase() === q);
  if (exact) return exact.href;

  const scored = searchSuggestions
    .map((s) => {
      let score = 0;
      if (s.label.toLowerCase().includes(q)) score += 5;
      for (const k of s.keywords) {
        if (q.includes(k) || k.includes(q)) score += 3;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored[0]) return scored[0].s.href;

  const cat = categories.find(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.shortTitle.toLowerCase().includes(q) ||
      c.productName.toLowerCase().includes(q),
  );
  if (cat) return categoryDetailsHref(cat);

  return `/categories?q=${encodeURIComponent(query.trim())}`;
}

export function filterSuggestions(
  query: string,
  limit = 8,
): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return searchSuggestions.filter((s) => s.group === "service").slice(0, limit);
  }
  return searchSuggestions
    .filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.blurb.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q) || q.includes(k)),
    )
    .slice(0, limit);
}
