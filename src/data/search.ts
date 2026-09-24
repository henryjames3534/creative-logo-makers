import { categories } from "@/data/categories";
import { categoryDetailsHref } from "@/data/serviceRoutes";

export type SearchSuggestion = {
  label: string;
  href: string;
  keywords: string[];
};

/** Maps free-text search → local category / flow routes */
export const searchSuggestions: SearchSuggestion[] = [
  {
    label: "Logo design",
    href: "/logo-design/details",
    keywords: ["logo", "logos", "logotype", "wordmark", "brand mark"],
  },
  {
    label: "Branding",
    href: "/logo-design/details",
    keywords: ["brand", "branding", "identity", "brand kit", "brand guide"],
  },
  {
    label: "Website design",
    href: "/website-design/details",
    keywords: ["website", "web", "landing", "homepage", "site"],
  },
  {
    label: "App UI design",
    href: "/website-design/details",
    keywords: ["app", "ui", "ux", "mobile", "dashboard"],
  },
  {
    label: "Business cards",
    href: "/business-advertising/details",
    keywords: ["business card", "cards", "flyer", "poster", "ads", "advertising"],
  },
  {
    label: "Art & illustration",
    href: "/art-illustration/details",
    keywords: ["art", "illustration", "mascot", "character", "drawing"],
  },
  {
    label: "Packaging design",
    href: "/packaging-design/details",
    keywords: ["packaging", "label", "box", "product packaging", "pouch"],
  },
  {
    label: "Book cover design",
    href: "/book-cover-design/details",
    keywords: ["book", "cover", "ebook", "paperback"],
  },
  {
    label: "T-shirt & merchandise",
    href: "/t-shirt-design/details",
    keywords: ["t-shirt", "tshirt", "merch", "hoodie", "apparel"],
  },
  {
    label: "Social media content",
    href: "/social-media-design/details",
    keywords: ["social", "instagram", "content", "carousel", "thumbnail"],
  },
  {
    label: "Free Logo Maker",
    href: "/logo-maker",
    keywords: ["logo maker", "free logo", "make a logo"],
  },
  {
    label: "Design contest",
    href: "/contests",
    keywords: ["contest", "competition", "many designers"],
  },
  {
    label: "Hire a designer",
    href: "/designers/search",
    keywords: ["hire", "designer", "freelance", "1-to-1", "project"],
  },
];

export const popularSearchLinks = [
  { label: "Logo design", href: "/logo-design/details", query: "Logo design" },
  { label: "Website", href: "/website-design/details", query: "Website design" },
  { label: "Branding", href: "/logo-design/details", query: "Branding" },
  { label: "Packaging", href: "/packaging-design/details", query: "Packaging design" },
] as const;

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

export function filterSuggestions(query: string, limit = 6): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return searchSuggestions.slice(0, limit);
  return searchSuggestions
    .filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q) || q.includes(k)),
    )
    .slice(0, limit);
}
