/**
 * USA-focused SEO keyword map for Creative Logo Makers.
 * Primary targets: logo design, website design, mobile app design + full catalog.
 */

import { categories, type Category } from "@/data/categories";

export type SeoFaq = { question: string; answer: string };

export type UsaSeoCluster = {
  /** Main ranking keyword (US intent) */
  primary: string;
  /** Supporting keywords */
  secondary: string[];
  /** Long-tail / commercial intent */
  longTail: string[];
  /** <title> without site name suffix */
  title: string;
  /** Meta description ~150–160 chars */
  description: string;
  /** Optional H1 override */
  h1?: string;
  faqs: SeoFaq[];
};

const US_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Dallas",
  "Miami",
  "Atlanta",
  "Seattle",
  "Boston",
  "San Francisco",
  "Austin",
  "Denver",
  "Phoenix",
  "Philadelphia",
];

function cityTails(service: string): string[] {
  return US_CITIES.slice(0, 8).map((c) => `${service} ${c}`);
}

function genericFaqs(product: string, price: string): SeoFaq[] {
  const p = product.toLowerCase();
  return [
    {
      question: `How much does ${p} cost in the USA?`,
      answer: `On Creative Logo Makers, ${p} contests start from ${price}. You can also hire a designer 1-to-1 from about $499 depending on scope. Packages include concepts, revisions, and final files.`,
    },
    {
      question: `How do I hire a ${p} designer?`,
      answer: `Launch a design contest for multiple concepts, or hire one specialist for a private 1-to-1 project. Share your brief, review designs, request revisions, and download production-ready files.`,
    },
    {
      question: `Do I own the final ${p}?`,
      answer: `Yes. When your project is complete and the winning design is transferred, you receive commercial ownership of the final files for use across your business.`,
    },
    {
      question: `How long does ${p} take?`,
      answer: `Most contests start receiving concepts within days. Total timelines depend on package, feedback speed, and revisions. Share your deadline in the brief and we will help you plan.`,
    },
  ];
}

/** Hand-crafted clusters for highest-volume USA keywords */
const OVERRIDES: Record<string, UsaSeoCluster> = {
  "logo-design": {
    primary: "logo design",
    secondary: [
      "custom logo design",
      "business logo design",
      "logo design services",
      "logo designer",
      "professional logo design",
      "logo design company",
      "logo design USA",
      "affordable logo design",
      "logo design contest",
      "brand logo design",
    ],
    longTail: [
      "logo design for small business",
      "best logo design services online",
      "hire a logo designer USA",
      "cheap professional logo design",
      "custom logo design with copyright",
      ...cityTails("logo design"),
    ],
    title: "Logo Design Services in the USA — Custom Logos from $249",
    description:
      "Get professional logo design in the USA via contest or 1-to-1. Custom concepts, revisions, full copyright, and print/digital files — starting from $249.",
    h1: "Custom logo design for US businesses",
    faqs: [
      {
        question: "How much does logo design cost in the USA?",
        answer:
          "Creative Logo Makers logo design contests start from $249 (sale pricing may apply). Higher tiers add more concepts and revisions. 1-to-1 logo projects start from about $499.",
      },
      {
        question: "What is a logo design contest?",
        answer:
          "Multiple vetted designers submit custom logo concepts based on your brief. You compare options, pick a winner, request revisions, and receive final files with commercial ownership.",
      },
      {
        question: "Can I get a business logo with source files?",
        answer:
          "Yes. Completed projects include web and print-ready exports plus editable source files so you can use your logo across website, packaging, and social media.",
      },
      {
        question: "Do you offer logo design for startups and small businesses?",
        answer:
          "Absolutely. Most US clients are startups and small businesses. Start with a clear brief, set a budget, and choose Bronze–Platinum packages based on how many concepts you want.",
      },
    ],
  },
  "web-design": {
    primary: "website design",
    secondary: [
      "web design",
      "web designer",
      "web design services",
      "web design company",
      "web design agency",
      "website design services",
      "professional website design",
      "custom website design",
      "responsive web design",
      "business website design",
    ],
    longTail: [
      "website design for small business USA",
      "hire a web designer online",
      "affordable website design services",
      "landing page and website design",
      "ecommerce website design services",
      ...cityTails("website design"),
    ],
    title: "Website Design Services in the USA — Custom Web Design Contests",
    description:
      "Professional website design in the USA. Launch a contest or hire a web designer 1-to-1 for custom, conversion-focused site designs — packages from $249.",
    h1: "Website design services for US brands",
    faqs: [
      {
        question: "How much does website design cost in the USA?",
        answer:
          "Website design contests on Creative Logo Makers start from package pricing around $249+. Full builds and complex sites are scoped as 1-to-1 or Studio projects.",
      },
      {
        question: "Do you design WordPress or Shopify sites?",
        answer:
          "Designers can deliver layouts and UI for WordPress, Shopify, Squarespace, and custom builds. Tell us your platform in the brief so concepts match your stack.",
      },
      {
        question: "Is mobile-responsive website design included?",
        answer:
          "Yes — modern website design work targets desktop and mobile layouts. Share device priorities and examples you like in your brief.",
      },
    ],
  },
  "mobile-app-design": {
    primary: "mobile app design",
    secondary: [
      "app design",
      "mobile app UI design",
      "UI UX design",
      "app designer",
      "mobile application design",
      "iOS app design",
      "Android app design",
      "app interface design",
      "mobile UX design",
    ],
    longTail: [
      "mobile app design services USA",
      "hire mobile app designer",
      "UI UX design for startups",
      "app screen design contest",
      ...cityTails("mobile app design"),
    ],
    title: "Mobile App Design Services in the USA — UI/UX Contests",
    description:
      "Hire mobile app designers in the USA for UI/UX screens, flows, and polished interfaces. Contest or 1-to-1 — get multiple concepts and production-ready designs.",
    h1: "Mobile app design & UI/UX for US products",
    faqs: [
      {
        question: "Do you design iOS and Android apps?",
        answer:
          "Yes. Mobile app design covers iOS, Android, and cross-platform UI. Specify platform guidelines (Apple HIG / Material) in your brief for better results.",
      },
      {
        question: "What do I receive from an app design project?",
        answer:
          "Typically key screens, flows, and design files ready for developer handoff. Higher packages include more screens and revision rounds.",
      },
    ],
  },
  "ios-app-design": {
    primary: "iOS app design",
    secondary: [
      "iphone app design",
      "iOS UI design",
      "Apple app design",
      "iOS UX design",
      "iPad app design",
    ],
    longTail: [
      "iOS app design services USA",
      "hire iOS UI designer",
      ...cityTails("iOS app design"),
    ],
    title: "iOS App Design Services USA — Custom iPhone & iPad UI",
    description:
      "Get custom iOS app design from vetted designers in the USA. Contests and 1-to-1 projects for polished iPhone and iPad interfaces.",
    faqs: genericFaqs("iOS app design", "$249"),
  },
  "android-app-design": {
    primary: "Android app design",
    secondary: [
      "Android UI design",
      "Android UX design",
      "Google Play app design",
      "Material Design app",
    ],
    longTail: [
      "Android app design services USA",
      "hire Android UI designer",
      ...cityTails("Android app design"),
    ],
    title: "Android App Design Services USA — Material UI Contests",
    description:
      "Professional Android app design in the USA. Get Material-friendly UI concepts via contest or hire a dedicated app designer.",
    faqs: genericFaqs("Android app design", "$249"),
  },
  "landing-page-design": {
    primary: "landing page design",
    secondary: [
      "landing page designer",
      "sales page design",
      "conversion landing page",
      "product landing page design",
    ],
    longTail: [
      "landing page design services USA",
      "hire landing page designer",
      ...cityTails("landing page design"),
    ],
    title: "Landing Page Design Services USA — High-Converting Pages",
    description:
      "Landing page design for US marketers and startups. Multiple creative concepts, clear CTAs, and files ready for Webflow, WordPress, or custom builds.",
    faqs: genericFaqs("landing page design", "$249"),
  },
  "product-packaging-design": {
    primary: "packaging design",
    secondary: [
      "product packaging design",
      "packaging designer",
      "custom packaging design",
      "retail packaging design",
    ],
    longTail: [
      "product packaging design USA",
      "hire packaging designer",
      ...cityTails("packaging design"),
    ],
    title: "Product Packaging Design USA — Custom Pack & Label Design",
    description:
      "Stand out on shelf with custom packaging design. Contests and 1-to-1 projects for US brands — food, beauty, retail, and more.",
    faqs: genericFaqs("product packaging design", "$249"),
  },
  "business-card-design": {
    primary: "business card design",
    secondary: [
      "custom business cards",
      "professional business card design",
      "visiting card design",
    ],
    longTail: [
      "business card design services USA",
      ...cityTails("business card design"),
    ],
    title: "Business Card Design Services USA — Custom Print-Ready Cards",
    description:
      "Professional business card design with print-ready files. Launch a contest or hire a designer for polished US business stationery.",
    faqs: genericFaqs("business card design", "$249"),
  },
  "social-media-page-design": {
    primary: "social media design",
    secondary: [
      "instagram design",
      "social media branding",
      "facebook cover design",
      "social media graphics",
    ],
    longTail: [
      "social media design services USA",
      "hire social media designer",
      ...cityTails("social media design"),
    ],
    title: "Social Media Design Services USA — Profiles, Posts & Covers",
    description:
      "Social media design for US brands — page kits, covers, and on-brand creatives via contest or 1-to-1 designer hire.",
    faqs: genericFaqs("social media design", "$249"),
  },
  "t-shirt-design": {
    primary: "t-shirt design",
    secondary: [
      "custom t-shirt design",
      "apparel design",
      "merchandise design",
      "tee shirt design",
    ],
    longTail: [
      "t-shirt design services USA",
      "hire t-shirt designer",
      ...cityTails("t-shirt design"),
    ],
    title: "T-Shirt Design Services USA — Custom Apparel Graphics",
    description:
      "Custom t-shirt and apparel design from US-friendly contests. Get print-ready graphics for merch drops and brands.",
    faqs: genericFaqs("t-shirt design", "$249"),
  },
  "book-cover-design": {
    primary: "book cover design",
    secondary: [
      "ebook cover design",
      "book cover designer",
      "custom book covers",
    ],
    longTail: [
      "book cover design services USA",
      "hire book cover designer",
      ...cityTails("book cover design"),
    ],
    title: "Book Cover Design Services USA — Print & Ebook Covers",
    description:
      "Professional book cover design for US authors and publishers. Contests deliver multiple covers — pick a winner and get print-ready files.",
    faqs: genericFaqs("book cover design", "$249"),
  },
  "brand-guide": {
    primary: "brand guidelines",
    secondary: [
      "brand guide design",
      "brand style guide",
      "brand identity guidelines",
    ],
    longTail: [
      "brand guidelines design USA",
      "hire brand identity designer",
    ],
    title: "Brand Guidelines Design USA — Style Guides & Identity Systems",
    description:
      "Build a professional brand guide with colors, type, and usage rules. Contests and Studio options for US companies.",
    faqs: genericFaqs("brand guide design", "$329"),
  },
  "full-service-branding": {
    primary: "branding agency",
    secondary: [
      "brand identity design",
      "full service branding",
      "branding services USA",
      "corporate branding",
    ],
    longTail: [
      "full service branding for startups",
      "hire branding agency online",
    ],
    title: "Full-Service Branding USA — Identity Systems & Brand Strategy",
    description:
      "Full-service branding for US businesses — identity, systems, and launch-ready assets through contests or Creative Logo Makers Studio.",
    faqs: genericFaqs("branding", "$499"),
  },
};

function autoCluster(cat: Category): UsaSeoCluster {
  const name = cat.productName;
  const base = name.toLowerCase();
  const price = cat.startingPrice;
  return {
    primary: base,
    secondary: [
      `${base} services`,
      `custom ${base}`,
      `professional ${base}`,
      `${base} company`,
      `hire ${base} designer`,
      `${base} USA`,
      `${base} contest`,
      `affordable ${base}`,
    ],
    longTail: [
      `${base} for small business`,
      `best ${base} online`,
      `${base} with copyright`,
      ...cityTails(base).slice(0, 5),
    ],
    title: `${name} Services in the USA — Contests from ${price}`,
    description: `${cat.description} Get ${base} via contest or 1-to-1 in the USA. Starting from ${price} with revisions, final files, and commercial ownership.`,
    h1: `${name} for US businesses`,
    faqs: genericFaqs(name, price),
  };
}

const cache = new Map<string, UsaSeoCluster>();

export function getUsaSeoForSlug(slug: string): UsaSeoCluster {
  if (cache.has(slug)) return cache.get(slug)!;
  if (OVERRIDES[slug]) {
    cache.set(slug, OVERRIDES[slug]!);
    return OVERRIDES[slug]!;
  }
  const cat = categories.find((c) => c.slug === slug);
  const cluster = cat
    ? autoCluster(cat)
    : {
        primary: slug.replace(/-/g, " "),
        secondary: [],
        longTail: [],
        title: slug.replace(/-/g, " "),
        description: "Professional design services in the USA.",
        faqs: [],
      };
  cache.set(slug, cluster);
  return cluster;
}

export function allKeywordsForSlug(slug: string, limit = 80): string[] {
  const c = getUsaSeoForSlug(slug);
  const base = c.primary;
  const modifiers = [
    "near me",
    "USA",
    "United States",
    "company",
    "agency",
    "services",
    "cost",
    "price",
    "cheap",
    "affordable",
    "professional",
    "best",
    "top",
    "hire",
    "freelance",
    "online",
    "for small business",
    "for startups",
    "contest",
    "2026",
  ];
  const expanded = modifiers.flatMap((m) => [
    `${base} ${m}`,
    `${m} ${base}`,
  ]);
  const all = [c.primary, ...c.secondary, ...c.longTail, ...expanded];
  return [...new Set(all.map((k) => k.trim()).filter(Boolean))].slice(0, limit);
}

/** Sitewide / pillar page keyword sets (USA) */
export const USA_SEO_PILLARS = {
  home: {
    title:
      "Logo Design, Website Design & Mobile App Design Contests | Creative Logo Makers USA",
    description:
      "Creative Logo Makers — USA-ready logo design, website design, mobile app UI, packaging, and branding. Launch a contest or hire a designer. From $249.",
    keywords: [
      "logo design",
      "website design",
      "web design",
      "mobile app design",
      "graphic design",
      "branding services",
      "design contest",
      "hire a designer",
      "custom logo design",
      "packaging design",
      "UI UX design",
      "logo design USA",
      "web design company",
      "logo design near me",
      "hire logo designer",
      "affordable website design",
      "branding agency USA",
      "app design services",
      "Creative Logo Makers",
    ],
  },
  contests: {
    title: "Design Contests USA — Logo, Web & Graphic Design Competitions",
    description:
      "Launch a design contest in the USA and get dozens of custom concepts. Logo design, website design, packaging, and more — pick a winner with confidence.",
    keywords: [
      "design contest",
      "logo contest",
      "graphic design contest",
      "design competition USA",
      "crowdsourced design",
    ],
  },
  projects: {
    title: "Hire a Designer USA — 1-to-1 Logo, Web & App Design Projects",
    description:
      "Hire a vetted designer for private 1-to-1 projects. Logo, website, mobile app, and branding — milestones, chat, and revisions included.",
    keywords: [
      "hire a designer",
      "hire logo designer",
      "hire web designer",
      "1-to-1 design project",
      "freelance designer USA",
    ],
  },
  pricing: {
    title: "Design Pricing USA — Logo, Website & Contest Packages",
    description:
      "Transparent US pricing for design contests and 1-to-1 projects. Logo design from $249, projects from $499 — compare Bronze to Platinum packages.",
    keywords: [
      "logo design cost",
      "website design cost",
      "design contest pricing",
      "hire designer price",
    ],
  },
  categories: {
    title: "Design Services USA — Logo, Web, App, Packaging & More",
    description:
      "Browse all Creative Logo Makers design services for the USA market: logo design, website design, mobile apps, packaging, merch, and branding.",
    keywords: [
      "design services",
      "graphic design services",
      "logo design services",
      "web design services",
      "branding services",
    ],
  },
  "logo-maker": {
    title: "Free Logo Maker USA — Create a Logo Online Instantly",
    description:
      "Free logo maker to create quick concepts online. Use it for inspiration, then hire designers or launch a logo design contest for a polished brand mark.",
    keywords: [
      "free logo maker",
      "logo maker",
      "create a logo online",
      "logo generator",
      "make a logo free",
    ],
  },
  "how-it-works": {
    title: "How Design Contests Work — Brief, Concepts, Winner, Files",
    description:
      "See how Creative Logo Makers works: write a brief, receive concepts, request revisions, and download final files with ownership.",
    keywords: [
      "how design contests work",
      "how to hire a designer online",
      "design contest process",
    ],
  },
  designers: {
    title: "Hire Designers USA — Logo, Web & App Design Talent",
    description:
      "Browse vetted designers for logo design, website design, mobile apps, and branding. Filter by skill and start a project.",
    keywords: [
      "hire designers",
      "logo designers for hire",
      "web designers for hire",
      "freelance graphic designer USA",
    ],
  },
  studio: {
    title: "Creative Logo Makers Studio — Full-Service Branding USA",
    description:
      "Studio branding for US launches: strategy, identity systems, and brand development packs with senior creatives.",
    keywords: [
      "branding agency USA",
      "full service branding",
      "brand strategy",
      "brand identity agency",
    ],
  },
  contact: {
    title: "Contact Creative Logo Makers — US Design Support",
    description:
      "Contact Creative Logo Makers for logo, website, and app design help. US phone lines and live chat support.",
    keywords: ["contact design agency", "logo design support"],
  },
  about: {
    title: "About Creative Logo Makers — Design Contests & Projects USA",
    description:
      "Learn about Creative Logo Makers — the marketplace for logo design, website design, and creative contests trusted by businesses worldwide.",
    keywords: ["about Creative Logo Makers", "design marketplace"],
  },
} as const;

/** Flat export count helper for reporting */
export function countUsaKeywordPhrases(): number {
  let n = 0;
  for (const cat of categories) {
    n += allKeywordsForSlug(cat.slug, 100).length;
  }
  for (const pillar of Object.values(USA_SEO_PILLARS)) {
    n += pillar.keywords.length;
  }
  return n;
}
