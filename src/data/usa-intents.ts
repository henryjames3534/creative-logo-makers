/**
 * High-intent USA commercial keyword pages under /usa/[slug].
 * Hand-crafted intents win over generated catalog rows when slugs overlap.
 */

import catalog from "@/data/usa-keyword-catalog.json";

export type UsaIntent = {
  slug: string;
  /** Primary ranking phrase */
  keyword: string;
  /** Related phrases for meta + on-page */
  related: string[];
  /** Category slug to deep-link packages / launch */
  serviceSlug: string;
  title: string;
  description: string;
  h1: string;
  /** From planner catalog (optional) */
  source?: string;
};

export const USA_INTENTS: UsaIntent[] = [
  {
    slug: "logo-design-near-me",
    keyword: "logo design near me",
    related: [
      "logo designer near me",
      "local logo design",
      "logo design company near me",
      "custom logo near me",
    ],
    serviceSlug: "logo-design",
    title: "Logo Design Near Me — Custom Logos for US Businesses (2026)",
    description:
      "Need logo design near me? Creative Logo Makers connects US businesses with designers nationwide — contests from $249, remote delivery, full commercial files.",
    h1: "Logo design near me — hire designers across the USA",
  },
  {
    slug: "hire-logo-designer",
    keyword: "hire logo designer",
    related: [
      "hire a logo designer",
      "hire logo designer USA",
      "freelance logo designer for hire",
      "best logo designer to hire",
    ],
    serviceSlug: "logo-design",
    title: "Hire a Logo Designer USA — Contests & 1-to-1 Projects",
    description:
      "Hire a logo designer in the USA via contest or private project. Compare custom concepts, request revisions, and own the final brand mark.",
    h1: "Hire a logo designer for your US brand",
  },
  {
    slug: "cheap-logo-design",
    keyword: "cheap logo design",
    related: [
      "affordable logo design",
      "inexpensive logo design",
      "budget logo design USA",
      "low cost professional logo",
    ],
    serviceSlug: "logo-design",
    title: "Cheap Logo Design USA — Affordable Professional Logos from $249",
    description:
      "Affordable logo design without looking cheap. US startups get multiple concepts via contest — professional results from $249.",
    h1: "Cheap logo design that still looks premium",
  },
  {
    slug: "custom-logo-design",
    keyword: "custom logo design",
    related: [
      "custom logo",
      "bespoke logo design",
      "unique logo design",
      "custom business logo",
    ],
    serviceSlug: "logo-design",
    title: "Custom Logo Design USA — Unique Logos Built for Your Brand",
    description:
      "Custom logo design for US companies. No templates — real designers create original marks matched to your brief.",
    h1: "Custom logo design for American businesses",
  },
  {
    slug: "business-logo-design",
    keyword: "business logo design",
    related: [
      "company logo design",
      "corporate logo design",
      "small business logo",
      "startup logo design",
    ],
    serviceSlug: "logo-design",
    title: "Business Logo Design USA — Company & Startup Logos",
    description:
      "Business logo design for startups and established US companies. Contests and 1-to-1 projects with print and web files.",
    h1: "Business logo design that builds trust",
  },
  {
    slug: "professional-logo-design",
    keyword: "professional logo design",
    related: [
      "professional logo designer",
      "pro logo design services",
      "high quality logo design",
    ],
    serviceSlug: "logo-design",
    title: "Professional Logo Design Services USA — From $249",
    description:
      "Professional logo design services for US brands. Multiple designer concepts, revisions, and commercial ownership.",
    h1: "Professional logo design services online",
  },
  {
    slug: "logo-design-company",
    keyword: "logo design company",
    related: [
      "logo design agency",
      "best logo design company",
      "logo design firm USA",
    ],
    serviceSlug: "logo-design",
    title: "Logo Design Company USA — Creative Logo Makers Contests",
    description:
      "Looking for a logo design company in the USA? Get agency-quality marks via Creative Logo Makers contests and Studio branding.",
    h1: "A logo design company built for online briefs",
  },
  {
    slug: "website-design-near-me",
    keyword: "website design near me",
    related: [
      "web design near me",
      "website designer near me",
      "local web design company",
    ],
    serviceSlug: "web-design",
    title: "Website Design Near Me — US Web Design Contests",
    description:
      "Website design near me without locking into a local retainer. US businesses launch contests for custom page design nationwide.",
    h1: "Website design near me — nationwide designers, USD pricing",
  },
  {
    slug: "hire-web-designer",
    keyword: "hire web designer",
    related: [
      "hire a web designer",
      "hire website designer USA",
      "freelance web designer for hire",
    ],
    serviceSlug: "web-design",
    title: "Hire a Web Designer USA — Contests & 1-to-1",
    description:
      "Hire a web designer in the USA through contest or private project. Clear packages and revision rounds.",
    h1: "Hire a web designer who ships conversion-ready pages",
  },
  {
    slug: "affordable-website-design",
    keyword: "affordable website design",
    related: [
      "cheap website design",
      "budget web design USA",
      "affordable web designer",
    ],
    serviceSlug: "web-design",
    title: "Affordable Website Design USA — Fixed Contest Packages",
    description:
      "Affordable website design for US startups. Fixed contest packages beat open-ended agency quotes.",
    h1: "Affordable website design with a clear budget",
  },
  {
    slug: "small-business-website-design",
    keyword: "small business website design",
    related: [
      "website for small business",
      "SMB web design",
      "small business web designer",
    ],
    serviceSlug: "web-design",
    title: "Small Business Website Design USA",
    description:
      "Small business website design that looks credible and converts — contests sized for US SMB budgets.",
    h1: "Small business website design that looks established",
  },
  {
    slug: "ecommerce-website-design",
    keyword: "ecommerce website design",
    related: [
      "online store design",
      "shopify style web design",
      "ecommerce page design",
    ],
    serviceSlug: "web-design",
    title: "Ecommerce Website Design USA — Storefront Pages",
    description:
      "Ecommerce website design concepts for US brands — product pages, landing layouts, and shop visuals.",
    h1: "Ecommerce website design built to sell",
  },
  {
    slug: "landing-page-design-services",
    keyword: "landing page design",
    related: [
      "landing page designer",
      "conversion landing page",
      "sales page design",
    ],
    serviceSlug: "landing-page-design",
    title: "Landing Page Design Services USA",
    description:
      "Landing page design services for US marketers — focused layouts for ads, launches, and lead gen.",
    h1: "Landing page design that respects your ad spend",
  },
  {
    slug: "mobile-app-design-services",
    keyword: "mobile app design",
    related: [
      "app ui design",
      "mobile app designer USA",
      "app interface design",
    ],
    serviceSlug: "mobile-app-design",
    title: "Mobile App Design Services USA",
    description:
      "Mobile app design services with contest variety or 1-to-1 specialists for US product teams.",
    h1: "Mobile app design for products that need clarity",
  },
  {
    slug: "hire-app-designer",
    keyword: "hire app designer",
    related: [
      "hire mobile app designer",
      "app designer for hire",
      "hire ui designer",
    ],
    serviceSlug: "mobile-app-design",
    title: "Hire an App Designer USA",
    description:
      "Hire an app designer in the USA — compare concepts via contest or work privately 1-to-1.",
    h1: "Hire an app designer without a six-month agency pitch",
  },
  {
    slug: "ui-ux-design-services",
    keyword: "ui ux design",
    related: [
      "ui ux designer",
      "ux design services USA",
      "product ui design",
    ],
    serviceSlug: "mobile-app-design",
    title: "UI UX Design Services USA",
    description:
      "UI/UX design services for US startups — screens, flows, and polished interface concepts.",
    h1: "UI UX design that product teams can ship from",
  },
  {
    slug: "packaging-design-services",
    keyword: "packaging design",
    related: [
      "product packaging design",
      "packaging designer USA",
      "retail packaging design",
    ],
    serviceSlug: "product-packaging-design",
    title: "Packaging Design Services USA",
    description:
      "Packaging design services for US CPG and DTC brands — shelf-ready concepts via contest.",
    h1: "Packaging design that holds up on the shelf",
  },
  {
    slug: "branding-agency-usa",
    keyword: "branding agency",
    related: [
      "branding agency USA",
      "brand identity agency",
      "branding company",
    ],
    serviceSlug: "full-service-branding",
    title: "Branding Agency USA — Contests & Studio",
    description:
      "Branding agency alternative for US companies — contests for marks plus Studio for full systems.",
    h1: "Branding agency outcomes without the agency waitlist",
  },
  {
    slug: "brand-identity-design",
    keyword: "brand identity design",
    related: [
      "brand identity package",
      "visual identity design",
      "brand system design",
    ],
    serviceSlug: "full-service-branding",
    title: "Brand Identity Design USA",
    description:
      "Brand identity design for US businesses — logo systems, guides, and launch-ready assets.",
    h1: "Brand identity design that stays consistent",
  },
  {
    slug: "graphic-design-services-usa",
    keyword: "graphic design services",
    related: [
      "graphic designer USA",
      "graphic design company",
      "hire graphic designer",
    ],
    serviceSlug: "flyer-design",
    title: "Graphic Design Services USA",
    description:
      "Graphic design services across logos, print, and digital — US pricing and English support.",
    h1: "Graphic design services for everyday marketing needs",
  },
  {
    slug: "design-contest",
    keyword: "design contest",
    related: [
      "logo design contest",
      "design competition",
      "crowdsource logo design",
    ],
    serviceSlug: "logo-design",
    title: "Design Contest USA — Multiple Concepts, One Winner",
    description:
      "Run a design contest on Creative Logo Makers — multiple US designers compete on your brief.",
    h1: "Design contests that put options in front of you fast",
  },
  {
    slug: "logo-maker-online",
    keyword: "logo maker",
    related: [
      "online logo maker",
      "logo creator",
      "custom logo maker",
    ],
    serviceSlug: "logo-design",
    title: "Logo Maker Online — Real Designers, Not Templates",
    description:
      "Skip template logo makers. Creative Logo Makers pairs US businesses with real designers via contest.",
    h1: "A logo maker path that ends with original work",
  },
  {
    slug: "best-logo-design-services",
    keyword: "best logo design services",
    related: [
      "top logo design services",
      "best logo designer USA",
      "premium logo design",
    ],
    serviceSlug: "logo-design",
    title: "Best Logo Design Services USA",
    description:
      "Compare best-in-class logo design services through contests — multiple concepts before you commit.",
    h1: "Best logo design services ranked by options, not ads",
  },
  {
    slug: "ios-app-design-services",
    keyword: "ios app design",
    related: ["iphone app design", "ios ui design", "apple app design"],
    serviceSlug: "ios-app-design",
    title: "iOS App Design Services USA",
    description:
      "iOS app design services for US product teams — polished screens matched to Apple patterns.",
    h1: "iOS app design that feels native",
  },
  {
    slug: "android-app-design-services",
    keyword: "android app design",
    related: ["android ui design", "android app designer", "material design app"],
    serviceSlug: "android-app-design",
    title: "Android App Design Services USA",
    description:
      "Android app design services with contest variety for US startups shipping on Google Play.",
    h1: "Android app design ready for Play Store screenshots",
  },
  {
    slug: "social-media-design-services",
    keyword: "social media design",
    related: [
      "social media graphics",
      "instagram design services",
      "social page design",
    ],
    serviceSlug: "social-media-page-design",
    title: "Social Media Design Services USA",
    description:
      "Social media design services for US brands — profile kits, covers, and post templates.",
    h1: "Social media design that matches the brand, not a template pack",
  },
  {
    slug: "flyer-design-services",
    keyword: "flyer design",
    related: ["flyer designer", "event flyer design", "promotional flyer"],
    serviceSlug: "flyer-design",
    title: "Flyer Design Services USA",
    description:
      "Flyer design services for US events and local businesses — print-ready files included.",
    h1: "Flyer design that still works when printed",
  },
  {
    slug: "brochure-design-services",
    keyword: "brochure design",
    related: ["brochure designer", "tri fold brochure", "company brochure design"],
    serviceSlug: "brochure-design",
    title: "Brochure Design Services USA",
    description:
      "Brochure design services for US companies — clear layouts for sales and leave-behinds.",
    h1: "Brochure design for teams that still meet in person",
  },
  {
    slug: "business-card-design-services",
    keyword: "business card design",
    related: [
      "business card designer",
      "professional business cards",
      "custom business card",
    ],
    serviceSlug: "business-card-design",
    title: "Business Card Design Services USA",
    description:
      "Business card design services with print-ready files for US professionals.",
    h1: "Business card design that survives the networking pile",
  },
  {
    slug: "t-shirt-design-services",
    keyword: "t-shirt design",
    related: ["tshirt design", "merch design", "apparel design"],
    serviceSlug: "t-shirt-design",
    title: "T-Shirt Design Services USA",
    description:
      "T-shirt design services for US merch drops, events, and brand apparel.",
    h1: "T-shirt design built for print, not just pixels",
  },
  {
    slug: "book-cover-design-services",
    keyword: "book cover design",
    related: ["ebook cover design", "book cover designer", "novel cover design"],
    serviceSlug: "book-cover-design",
    title: "Book Cover Design Services USA",
    description:
      "Book cover design services for US authors — genre-aware covers that read at thumbnail size.",
    h1: "Book cover design that sells the click",
  },
  {
    slug: "wordpress-website-design",
    keyword: "wordpress website design",
    related: [
      "wordpress designer",
      "wordpress theme design",
      "wordpress web design",
    ],
    serviceSlug: "wordpress-theme-design",
    title: "WordPress Website Design USA",
    description:
      "WordPress website design concepts for US businesses that need flexible, editable sites.",
    h1: "WordPress website design without the theme soup",
  },
  {
    slug: "app-icon-design-services",
    keyword: "app icon design",
    related: ["app icon designer", "ios app icon", "android app icon"],
    serviceSlug: "app-icon-design",
    title: "App Icon Design Services USA",
    description:
      "App icon design services for US apps — distinctive icons for App Store and Play.",
    h1: "App icon design that stands out in a grid of sameness",
  },
  {
    slug: "illustration-services-usa",
    keyword: "illustration services",
    related: [
      "hire illustrator",
      "custom illustration",
      "business illustration",
    ],
    serviceSlug: "illustrations",
    title: "Illustration Services USA",
    description:
      "Illustration services for US brands — custom art for sites, products, and campaigns.",
    h1: "Illustration services with commercial ownership included",
  },
  {
    slug: "brand-guidelines-design",
    keyword: "brand guidelines",
    related: ["brand guide design", "brand book", "style guide design"],
    serviceSlug: "logo-brand-guide",
    title: "Brand Guidelines Design USA",
    description:
      "Brand guidelines design so US teams stay consistent across web, print, and social.",
    h1: "Brand guidelines your contractors will actually follow",
  },
  {
    slug: "startup-logo-design",
    keyword: "startup logo design",
    related: ["startup branding", "startup logo", "tech startup logo"],
    serviceSlug: "logo-design",
    title: "Startup Logo Design USA",
    description:
      "Startup logo design for US founders — fast contests, investor-ready marks.",
    h1: "Startup logo design before the pitch deck goes out",
  },
  {
    slug: "restaurant-logo-design",
    keyword: "restaurant logo design",
    related: ["cafe logo design", "food logo design", "restaurant branding"],
    serviceSlug: "logo-design",
    title: "Restaurant Logo Design USA",
    description:
      "Restaurant logo design for US cafes and dining brands — menus, signage, and social ready.",
    h1: "Restaurant logo design that works on a napkin and a neon sign",
  },
  {
    slug: "real-estate-logo-design",
    keyword: "real estate logo design",
    related: [
      "realtor logo",
      "brokerage logo design",
      "real estate branding",
    ],
    serviceSlug: "logo-design",
    title: "Real Estate Logo Design USA — Agent & Broker Brands",
    description:
      "Real estate logo design for agents and brokerages across the USA. Professional, trustworthy marks.",
    h1: "Real estate logo design that builds trust",
  },
  {
    slug: "fitness-logo-design",
    keyword: "fitness logo design",
    related: [
      "gym logo design",
      "fitness brand logo",
      "personal trainer logo",
    ],
    serviceSlug: "logo-design",
    title: "Fitness Logo Design USA — Gym & Trainer Brands",
    description:
      "Fitness logo design for gyms, trainers, and wellness brands in the USA.",
    h1: "Fitness logo design with energy",
  },
  {
    slug: "law-firm-logo-design",
    keyword: "law firm logo design",
    related: ["lawyer logo design", "attorney logo", "legal branding"],
    serviceSlug: "logo-design",
    title: "Law Firm Logo Design USA — Professional Legal Brands",
    description:
      "Law firm logo design for US attorneys — polished, credible identity concepts via contest.",
    h1: "Law firm logo design that signals authority",
  },

  // —— 70% off sale intents (append-only; do not edit rows above) ——
  {
    slug: "70-off-logo-design",
    keyword: "70% off logo design",
    related: [
      "logo design 70 percent off",
      "logo design discount USA",
      "70% off logo design USA",
      "logo package sale",
    ],
    serviceSlug: "logo-design",
    title: "70% Off Logo Design USA — Sale Packages from $75 (Was $249)",
    description:
      "70% off logo design for US businesses. Contest packages on sale — Bronze from $75 (was $249). Multiple concepts, revisions, commercial files.",
    h1: "70% off logo design — USA package sale",
  },
  {
    slug: "logo-design-discount-usa",
    keyword: "logo design discount USA",
    related: [
      "logo design sale USA",
      "discount logo design packages",
      "logo contest discount",
      "cheap logo design sale",
    ],
    serviceSlug: "logo-design",
    title: "Logo Design Discount USA — 70% Off Contest Packages",
    description:
      "Logo design discount USA: sitewide 70% off contest packages. Launch a brief, compare concepts, and pick a winner with sale pricing.",
    h1: "Logo design discount for American brands",
  },
  {
    slug: "logo-design-package-sale",
    keyword: "logo design package sale",
    related: [
      "logo package deal",
      "logo design sale",
      "logo contest package discount",
      "business logo package sale",
    ],
    serviceSlug: "logo-design",
    title: "Logo Design Package Sale USA — 70% Off Bronze to Platinum",
    description:
      "Logo design package sale across Bronze, Silver, Gold, and Platinum. US startups lock in 70% off list while the promo runs.",
    h1: "Logo design package sale — every tier 70% off",
  },
  {
    slug: "cheap-logo-design-70-off",
    keyword: "cheap logo design 70% off",
    related: [
      "budget logo design sale",
      "affordable logo design 70% off",
      "low cost logo design discount",
      "inexpensive logo package sale",
    ],
    serviceSlug: "logo-design",
    title: "Cheap Logo Design 70% Off USA — From $75",
    description:
      "Cheap logo design with 70% off sale pricing. Professional contest concepts for US businesses starting at $75 (was $249).",
    h1: "Cheap logo design — 70% off sale pricing",
  },
  {
    slug: "70-off-website-design",
    keyword: "70% off website design",
    related: [
      "website design discount USA",
      "web design 70 percent off",
      "website package sale",
      "affordable website design sale",
    ],
    serviceSlug: "web-design",
    title: "70% Off Website Design USA — Contest Packages on Sale",
    description:
      "70% off website design for US businesses. Contest and package tiers on sale — clear pricing, custom concepts, commercial delivery.",
    h1: "70% off website design packages",
  },
  {
    slug: "website-design-discount",
    keyword: "website design discount",
    related: [
      "web design discount",
      "website design sale",
      "discount website design USA",
      "landing page design discount",
    ],
    serviceSlug: "web-design",
    title: "Website Design Discount USA — 70% Off Packages",
    description:
      "Website design discount with 70% off sitewide packages. Launch a contest for web or landing page concepts built for US brands.",
    h1: "Website design discount — sale pricing live",
  },
  {
    slug: "design-contest-70-off",
    keyword: "design contest 70% off",
    related: [
      "logo contest sale",
      "design contest discount USA",
      "graphic design contest 70% off",
      "design competition package sale",
    ],
    serviceSlug: "logo-design",
    title: "Design Contest 70% Off USA — Logo & Brand Packages",
    description:
      "Design contest 70% off for USA clients. Get multiple designer concepts with sale package pricing — logo, branding, and more.",
    h1: "Design contest sale — 70% off packages",
  },
  {
    slug: "70-off-branding-package",
    keyword: "70% off branding package",
    related: [
      "branding package sale",
      "brand identity discount USA",
      "branding services 70% off",
      "full branding package discount",
    ],
    serviceSlug: "full-service-branding",
    title: "70% Off Branding Package USA — Identity Contests on Sale",
    description:
      "70% off branding packages for US companies. Brand identity contests and packages with sale pricing while the promo lasts.",
    h1: "70% off branding packages for US teams",
  },
  {
    slug: "packaging-design-discount-usa",
    keyword: "packaging design discount USA",
    related: [
      "product packaging design sale",
      "packaging design 70% off",
      "label design discount",
      "packaging package sale",
    ],
    serviceSlug: "product-packaging-design",
    title: "Packaging Design Discount USA — 70% Off Packages",
    description:
      "Packaging design discount USA: 70% off contest packages for product packaging and labels. Shelf-ready concepts from US-focused designers.",
    h1: "Packaging design discount — 70% off sale",
  },
  {
    slug: "mobile-app-design-discount",
    keyword: "mobile app design discount",
    related: [
      "app design sale",
      "UI UX design discount USA",
      "mobile app design 70% off",
      "app design package sale",
    ],
    serviceSlug: "mobile-app-design",
    title: "Mobile App Design Discount USA — 70% Off Packages",
    description:
      "Mobile app design discount with 70% off packages. Contest UI concepts for US startups — clear tiers and commercial files.",
    h1: "Mobile app design discount — sale packages",
  },
  {
    slug: "hire-logo-designer-sale",
    keyword: "hire logo designer sale",
    related: [
      "hire logo designer discount",
      "hire a logo designer 70% off",
      "logo designer sale USA",
      "hire designer package sale",
    ],
    serviceSlug: "logo-design",
    title: "Hire a Logo Designer Sale USA — 70% Off Packages",
    description:
      "Hire a logo designer during our USA package sale — 70% off contest tiers. Compare concepts and own the final mark.",
    h1: "Hire a logo designer on sale — 70% off",
  },
  {
    slug: "business-logo-design-70-percent-off",
    keyword: "business logo design 70 percent off",
    related: [
      "company logo design sale",
      "business logo package discount",
      "startup logo 70% off",
      "small business logo design sale",
    ],
    serviceSlug: "logo-design",
    title: "Business Logo Design 70% Off USA — Sale from $75",
    description:
      "Business logo design 70 percent off for US companies. Contest packages on sale from $75 — multiple concepts and full ownership.",
    h1: "Business logo design — 70 percent off sale",
  },
  {
    slug: "graphic-design-services-discount",
    keyword: "graphic design services discount",
    related: [
      "graphic design sale USA",
      "graphic design package discount",
      "70% off graphic design",
      "affordable graphic design sale",
    ],
    serviceSlug: "logo-design",
    title: "Graphic Design Services Discount USA — 70% Off",
    description:
      "Graphic design services discount: 70% off Creative Logo Makers packages for US businesses — logos, ads, and more via contest.",
    h1: "Graphic design services — 70% off packages",
  },
  {
    slug: "t-shirt-design-discount-usa",
    keyword: "t-shirt design discount USA",
    related: [
      "t shirt design sale",
      "merch design 70% off",
      "apparel design discount",
      "t-shirt design package sale",
    ],
    serviceSlug: "t-shirt-design",
    title: "T-Shirt Design Discount USA — 70% Off Packages",
    description:
      "T-shirt design discount USA with 70% off contest packages. Custom merch concepts for US brands at sale pricing.",
    h1: "T-shirt design discount — 70% off sale",
  },
];

type CatalogFile = {
  count: number;
  pages: Array<{
    slug: string;
    keyword: string;
    related: string[];
    serviceSlug: string;
    title: string;
    description: string;
    h1: string;
    source?: string;
  }>;
};

const catalogFile = catalog as CatalogFile;
const handCraftedBySlug = new Map(USA_INTENTS.map((i) => [i.slug, i]));
const catalogBySlug = new Map(
  catalogFile.pages.map((p) => [
    p.slug,
    {
      slug: p.slug,
      keyword: p.keyword,
      related: p.related,
      serviceSlug: p.serviceSlug,
      title: p.title,
      description: p.description,
      h1: p.h1,
      source: p.source,
    } satisfies UsaIntent,
  ]),
);

/** All USA keyword pages (hand-crafted first, then catalog fill). */
export const ALL_USA_KEYWORD_PAGES: UsaIntent[] = (() => {
  const seen = new Set<string>();
  const out: UsaIntent[] = [];
  for (const i of USA_INTENTS) {
    seen.add(i.slug);
    out.push(i);
  }
  for (const p of catalogFile.pages) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(catalogBySlug.get(p.slug)!);
  }
  return out;
})();

export function getIntentBySlug(slug: string): UsaIntent | undefined {
  return handCraftedBySlug.get(slug) ?? catalogBySlug.get(slug);
}

export function intentPath(slug: string) {
  return `/usa/${slug}`;
}

/** Footer / hub samples — stable slice of commercial keywords */
export function usaKeywordFooterLinks(limit = 16): { href: string; label: string }[] {
  const preferred = [
    "logo-design-near-me",
    "hire-logo-designer",
    "cheap-logo-design",
    "custom-logo-design",
    "website-design-near-me",
    "hire-web-designer",
    "branding-agency-usa",
    "packaging-design-services",
    "business-card-design-services",
    "flyer-design-services",
    "t-shirt-design-services",
    "book-cover-design-services",
    "mobile-app-design-services",
    "startup-logo-design",
    "restaurant-logo-design",
    "law-firm-logo-design",
    "70-off-logo-design",
    "logo-design-discount-usa",
    "70-off-website-design",
    "design-contest-70-off",
  ];
  const links: { href: string; label: string }[] = [];
  for (const slug of preferred) {
    const intent = getIntentBySlug(slug);
    if (!intent) continue;
    links.push({ href: intentPath(intent.slug), label: intent.keyword });
    if (links.length >= limit) break;
  }
  return links;
}

export function relatedUsaKeywords(slug: string, limit = 10): UsaIntent[] {
  const current = getIntentBySlug(slug);
  if (!current) return ALL_USA_KEYWORD_PAGES.slice(0, limit);
  const same = ALL_USA_KEYWORD_PAGES.filter(
    (p) => p.slug !== slug && p.serviceSlug === current.serviceSlug,
  );
  if (same.length >= limit) return same.slice(0, limit);
  const rest = ALL_USA_KEYWORD_PAGES.filter(
    (p) => p.slug !== slug && p.serviceSlug !== current.serviceSlug,
  );
  return [...same, ...rest].slice(0, limit);
}
