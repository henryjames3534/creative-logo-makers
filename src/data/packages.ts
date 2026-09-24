export type PackageTier = {
  id: string;
  name: string;
  price: string;
  /** Pre-discount list price (shown struck through when set) */
  compareAtPrice?: string;
  blurb: string;
  featured?: boolean;
  features: string[];
  bestFor: string;
};

type TierPrices = {
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
};

/** Sitewide package sale — 50% off list prices */
export const PACKAGE_DISCOUNT_PERCENT = 50;

export function parsePackageAmount(raw: string): number {
  return Number(String(raw).replace(/[^0-9.]/g, "")) || 0;
}

export function formatUsdPrice(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/** Halve any "$X" / "From $X" price string. Leaves Custom / Available alone. */
export function applyPackageDiscount(price: string): string {
  if (!price || /custom|contact|available|quote/i.test(price)) return price;
  const amount = parsePackageAmount(price);
  if (!amount) return price;
  const discounted = formatUsdPrice(
    amount * (1 - PACKAGE_DISCOUNT_PERCENT / 100),
  );
  if (/^from\s+/i.test(price.trim())) return `From ${discounted}`;
  return discounted;
}

function discountTier(prices: TierPrices): TierPrices {
  return {
    bronze: applyPackageDiscount(prices.bronze),
    silver: applyPackageDiscount(prices.silver),
    gold: applyPackageDiscount(prices.gold),
    platinum: applyPackageDiscount(prices.platinum),
  };
}

/** Shared contest package copy */
const contestMeta: Omit<PackageTier, "price" | "compareAtPrice">[] = [
  {
    id: "bronze",
    name: "Bronze",
    blurb: "A custom design on a budget",
    bestFor: "Expect ~30 designs",
    features: [
      "100% money-back guarantee*",
      "Full copyright ownership",
      "Community of vetted designers",
      "Source + export files",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    blurb: "Get greater variety by attracting more designers",
    bestFor: "Expect ~60 designs",
    features: [
      "100% money-back guarantee*",
      "Full copyright ownership",
      "Higher prize money attracts more concepts",
      "More designer participation",
      "Source + export files",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    blurb: "High-quality design created by professional designers",
    featured: true,
    bestFor: "Expect ~90 designs",
    features: [
      "100% money-back guarantee*",
      "Full copyright ownership",
      "Mid & Top Level designers only",
      "Prioritized support",
      "Source + export files",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    blurb: "Work with the best talent & dedicated support",
    bestFor: "Expect ~60 premium designs",
    features: [
      "100% money-back guarantee*",
      "Full copyright ownership",
      "Top Level designers only",
      "Dedicated manager",
      "Prioritized support",
    ],
  },
];

/**
 * Bronze → Platinum contest list prices by service slug (pre-discount).
 * Keys = local service slugs (+ legacy aliases).
 */
const RAW_NINETY_NINE_DESIGN_PRICES: Record<string, TierPrices> = {
  "logo-design": { bronze: "$249", silver: "$399", gold: "$799", platinum: "$1,050" },
  "web-design": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "business-card-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "book-cover-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "t-shirt-design": { bronze: "$199", silver: "$299", gold: "$499", platinum: "$799" },
  "product-packaging-design": { bronze: "$449", silver: "$749", gold: "$1,199", platinum: "$1,699" },
  "product-label-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  illustrations: { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "landing-page-design": { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "mobile-app-design": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "social-media-page-design": { bronze: "$79", silver: "$129", gold: "$199", platinum: "$299" },
  "facebook-cover-design": { bronze: "$79", silver: "$129", gold: "$199", platinum: "$299" },
  "stationery-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "poster-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "brochure-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "logo-brand-guide": { bronze: "$329", silver: "$499", gold: "$899", platinum: "$1,199" },
  "brand-identity-pack": { bronze: "$599", silver: "$899", gold: "$1,699", platinum: "$2,499" },
  "logo-business-card-design": { bronze: "$449", silver: "$649", gold: "$1,199", platinum: "$1,599" },
  "social-media-pack": { bronze: "$399", silver: "$699", gold: "$1,299", platinum: "$1,799" },
  "merchandise-design": { bronze: "$199", silver: "$299", gold: "$499", platinum: "$799" },
  "character-mascot-design": { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "powerpoint-template-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "email-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "icon-button-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "infographic-design": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "magazine-cover-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "menu-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "podcast-cover-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "postcard-flyer-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "signage-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "sticker-design": { bronze: "$189", silver: "$249", gold: "$399", platinum: "$599" },
  "tattoo-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "wordpress-theme-design": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "clothing-apparel-design": { bronze: "$199", silver: "$299", gold: "$499", platinum: "$799" },
  "cup-mug-design": { bronze: "$189", silver: "$249", gold: "$399", platinum: "$599" },
  "banner-ad-design": { bronze: "$49", silver: "$79", gold: "$129", platinum: "$199" },
  "album-cover-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "3d-design": { bronze: "$449", silver: "$749", gold: "$1,199", platinum: "$1,699" },
  "card-invitation-design": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "car-truck-van-wrap-design": { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "other-art-illustration": { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "other-book-magazine-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "other-business-advertising": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "other-clothing-merchandise-design": { bronze: "$199", silver: "$299", gold: "$499", platinum: "$799" },
  "other-design": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  "other-packaging-label-design": { bronze: "$449", silver: "$749", gold: "$1,199", platinum: "$1,699" },
  "other-website-app-design": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "brand-starter-pack": { bronze: "$499", silver: "$749", gold: "$1,397", platinum: "$1,996" },
  "brand-launch-pack": { bronze: "$599", silver: "$899", gold: "$1,677", platinum: "$2,396" },
  "logo-website-squarespace": { bronze: "$1,399", silver: "$2,099", gold: "$3,917", platinum: "$5,596" },
  "brand-guide": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "full-service-branding": { bronze: "$4,499", silver: "$6,749", gold: "$12,597", platinum: "$17,996" },
  "website-builders": { bronze: "$549", silver: "$824", gold: "$1,537", platinum: "$2,196" },
  "website-redesign": { bronze: "$549", silver: "$824", gold: "$1,537", platinum: "$2,196" },
  "blog-design": { bronze: "$549", silver: "$824", gold: "$1,537", platinum: "$2,196" },
  "app-icon-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "website-icon-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "form-design": { bronze: "$349", silver: "$524", gold: "$977", platinum: "$1,396" },
  "ios-app-design": { bronze: "$599", silver: "$899", gold: "$1,677", platinum: "$2,396" },
  "android-app-design": { bronze: "$599", silver: "$899", gold: "$1,677", platinum: "$2,396" },
  "twitter-design": { bronze: "$79", silver: "$119", gold: "$221", platinum: "$316" },
  "youtube-channel-design": { bronze: "$79", silver: "$119", gold: "$221", platinum: "$316" },
  "leaflet-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "direct-mail-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "flyer-design": { bronze: "$169", silver: "$254", gold: "$473", platinum: "$676" },
  "booklet-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "pamphlet-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "billboard-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "trade-show-banner-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "banner-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "email-newsletter-design": { bronze: "$249", silver: "$374", gold: "$697", platinum: "$996" },
  "website-header-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "resume-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "word-template-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "trade-show-booth-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "jersey-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "bag-tote-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "cap-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "shopping-bag-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "business-illustration": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "website-illustration-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "book-illustration": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "pattern-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "invitation-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "greeting-card-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "wedding-invitation-design": { bronze: "$149", silver: "$224", gold: "$417", platinum: "$596" },
  "3d-architectural-rendering": { bronze: "$389", silver: "$584", gold: "$1,089", platinum: "$1,556" },
  "food-packaging-design": { bronze: "$349", silver: "$524", gold: "$977", platinum: "$1,396" },
  "retail-packaging-design": { bronze: "$349", silver: "$524", gold: "$977", platinum: "$1,396" },
  "cosmetics-packaging-design": { bronze: "$349", silver: "$524", gold: "$977", platinum: "$1,396" },
  "box-design": { bronze: "$349", silver: "$524", gold: "$977", platinum: "$1,396" },
  "food-label-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "beverage-label-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "beer-label-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "wine-label-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "interior-book-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  "ebook-cover-design": { bronze: "$199", silver: "$299", gold: "$557", platinum: "$796" },
  "book-layout-design": { bronze: "$299", silver: "$449", gold: "$837", platinum: "$1,196" },
  // Legacy aliases
  "logo-branding": { bronze: "$249", silver: "$399", gold: "$799", platinum: "$1,050" },
  "website-app": { bronze: "$599", silver: "$899", gold: "$1,599", platinum: "$2,499" },
  "business-advertising": { bronze: "$199", silver: "$299", gold: "$599", platinum: "$999" },
  "art-illustration": { bronze: "$349", silver: "$549", gold: "$899", platinum: "$1,399" },
  "packaging-label": { bronze: "$449", silver: "$749", gold: "$1,199", platinum: "$1,699" },
  "book-cover": { bronze: "$299", silver: "$499", gold: "$799", platinum: "$1,199" },
  merchandise: { bronze: "$199", silver: "$299", gold: "$499", platinum: "$799" },
  "social-content": { bronze: "$79", silver: "$129", gold: "$199", platinum: "$299" },
};

/** Live (50% off) contest prices by service slug */
export const ninetyNineDesignPrices: Record<string, TierPrices> =
  Object.fromEntries(
    Object.entries(RAW_NINETY_NINE_DESIGN_PRICES).map(([slug, tiers]) => [
      slug,
      discountTier(tiers),
    ]),
  );

/** @deprecated use ninetyNineDesignPrices */
export const categoryContestPrices = ninetyNineDesignPrices;

function buildPackages(rawPrices: TierPrices): PackageTier[] {
  return contestMeta.map((meta) => {
    const list = rawPrices[meta.id as keyof TierPrices];
    return {
      ...meta,
      price: applyPackageDiscount(list),
      compareAtPrice: list,
    };
  });
}

/** Default = logo design (homepage / pricing overview) */
export const contestPackages: PackageTier[] = buildPackages(
  RAW_NINETY_NINE_DESIGN_PRICES["logo-design"],
);

export function getContestPackages(categorySlug?: string): PackageTier[] {
  const prices =
    (categorySlug && RAW_NINETY_NINE_DESIGN_PRICES[categorySlug]) ||
    RAW_NINETY_NINE_DESIGN_PRICES["logo-design"];
  return buildPackages(prices);
}

export function getPackageById(
  id: string | undefined,
  categorySlug?: string,
): PackageTier {
  const packages = getContestPackages(categorySlug);
  if (!id) return packages.find((p) => p.id === "gold") ?? packages[0];
  return packages.find((p) => p.id === id) ?? packages[0];
}

export const projectPackages: PackageTier[] = [
  {
    id: "essential",
    name: "Essential Project",
    price: applyPackageDiscount("From $499"),
    compareAtPrice: "From $499",
    blurb: "One focused deliverable with a matched specialist.",
    bestFor: "Single assets",
    features: [
      "Matched designer shortlist",
      "1 primary deliverable",
      "2 revision rounds",
      "Milestone-based payments",
      "Direct chat collaboration",
    ],
  },
  {
    id: "growth",
    name: "Growth Project",
    price: applyPackageDiscount("From $999"),
    compareAtPrice: "From $999",
    featured: true,
    blurb: "Multi-asset packs for brands shipping fast.",
    bestFor: "Launch kits",
    features: [
      "Senior designer match",
      "Up to 3 related deliverables",
      "Unlimited revisions in scope",
      "Brand consistency check",
      "Source files included",
      "Priority matching",
    ],
  },
  {
    id: "retainer",
    name: "Creative Retainer",
    price: "Custom",
    blurb: "Ongoing design capacity — quote via Studio / Pro.",
    bestFor: "Always-on brands",
    features: [
      "Dedicated designer pod",
      "Weekly design sprints",
      "Queue for ads, social, decks",
      "Shared brand library",
      "Monthly strategy sync",
      "Contact for a quote",
    ],
  },
];

export const studioPackages: PackageTier[] = [
  {
    id: "full-service",
    name: "Full-service brand pack",
    price: applyPackageDiscount("From $4,499"),
    compareAtPrice: "From $4,499",
    featured: true,
    blurb: "Logo concepts through guidelines, cards, and digital assets — strategist-led.",
    bestFor: "New brands & rebrands",
    features: [
      "1-hr brand discovery",
      "9 curated logo concepts",
      "Finalized logo + brand guide",
      "Business card & LinkedIn assets",
      "Status calls + aftercare",
      "Full copyright ownership",
    ],
  },
  {
    id: "development",
    name: "Brand development pack",
    price: applyPackageDiscount("From $2,499"),
    compareAtPrice: "From $2,499",
    blurb: "Already have a logo? We build color, type, elements, and guidelines.",
    bestFor: "Logo → full system",
    features: [
      "2× brand development concepts",
      "Color story & fonts",
      "Visual elements",
      "Brand guidelines",
      "Senior brand designers",
      "Strategist coordination",
    ],
  },
  {
    id: "messaging",
    name: "Positioning & messaging",
    price: applyPackageDiscount("From $2,999"),
    compareAtPrice: "From $2,999",
    blurb: "StoryBrand™ workshop and messaging framework for your brand guide.",
    bestFor: "Clear brand story",
    features: [
      "Brand workshop",
      "Audience & positioning",
      "StoryBrand™ framework",
      "Messaging structure",
      "Tone & differentiators",
      "Guide-ready handoff",
    ],
  },
];

/** Common 99d bundle / add-on starting prices */
export const addOns = [
  {
    name: "Logo & social media pack",
    price: applyPackageDiscount("From $399"),
    compareAtPrice: "From $399",
  },
  {
    name: "Logo & business card",
    price: applyPackageDiscount("From $449"),
    compareAtPrice: "From $449",
  },
  {
    name: "Logo & brand guide",
    price: applyPackageDiscount("From $329"),
    compareAtPrice: "From $329",
  },
  {
    name: "Logo & brand identity pack",
    price: applyPackageDiscount("From $599"),
    compareAtPrice: "From $599",
  },
  {
    name: "Logo & website",
    price: applyPackageDiscount("From $1,399"),
    compareAtPrice: "From $1,399",
  },
  { name: "NDA & private contest", price: "Available at launch" },
];
