/**
 * High-intent USA commercial keyword pages.
 * Each intent maps to a ranking URL under /usa/[slug].
 */

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
    h1: "A logo design company built for US growth",
  },
  {
    slug: "website-design-near-me",
    keyword: "website design near me",
    related: [
      "web designer near me",
      "website designer near me",
      "local web design company",
    ],
    serviceSlug: "web-design",
    title: "Website Design Near Me — US Web Design Contests & Hire",
    description:
      "Website design near me, delivered remotely across the USA. Launch a contest or hire a web designer for custom layouts.",
    h1: "Website design near me — nationwide US talent",
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
    title: "Hire a Web Designer USA — Website Design Contests & Projects",
    description:
      "Hire a web designer for custom website design. Contests give multiple directions; 1-to-1 is ideal for private builds.",
    h1: "Hire a web designer for your website",
  },
  {
    slug: "affordable-website-design",
    keyword: "affordable website design",
    related: [
      "cheap website design",
      "budget web design USA",
      "low cost website design",
    ],
    serviceSlug: "web-design",
    title: "Affordable Website Design USA — Custom Sites from Contests",
    description:
      "Affordable website design for US small businesses. Get custom concepts via contest without agency retainers.",
    h1: "Affordable website design for growing brands",
  },
  {
    slug: "small-business-website-design",
    keyword: "website design for small business",
    related: [
      "small business web design",
      "SMB website design",
      "local business website design",
    ],
    serviceSlug: "web-design",
    title: "Website Design for Small Business USA — Fast & Custom",
    description:
      "Website design for small business owners in the USA. Clear packages, custom concepts, and files ready for WordPress or Webflow.",
    h1: "Website design for small businesses",
  },
  {
    slug: "ecommerce-website-design",
    keyword: "ecommerce website design",
    related: [
      "online store design",
      "shopify website design",
      "ecommerce web design USA",
    ],
    serviceSlug: "web-design",
    title: "Ecommerce Website Design USA — Store & Product Page UI",
    description:
      "Ecommerce website design for US brands — product pages, storefront UI, and conversion-focused layouts via contest or hire.",
    h1: "Ecommerce website design that sells",
  },
  {
    slug: "landing-page-design-services",
    keyword: "landing page design services",
    related: [
      "landing page designer",
      "sales page design",
      "high converting landing page",
    ],
    serviceSlug: "landing-page-design",
    title: "Landing Page Design Services USA — High-Converting Pages",
    description:
      "Landing page design services for US marketers. Multiple creative concepts, strong CTAs, production-ready files.",
    h1: "Landing page design services for campaigns",
  },
  {
    slug: "mobile-app-design-services",
    keyword: "mobile app design services",
    related: [
      "app design services",
      "mobile UI UX design",
      "app designer USA",
    ],
    serviceSlug: "mobile-app-design",
    title: "Mobile App Design Services USA — UI/UX Contests",
    description:
      "Mobile app design services for iOS and Android. Get UI/UX screens via contest or hire a dedicated app designer.",
    h1: "Mobile app design services for US products",
  },
  {
    slug: "hire-app-designer",
    keyword: "hire app designer",
    related: [
      "hire mobile app designer",
      "hire UI UX designer",
      "app designer for hire",
    ],
    serviceSlug: "mobile-app-design",
    title: "Hire an App Designer USA — Mobile UI/UX Projects",
    description:
      "Hire an app designer for polished mobile UI. Contests and 1-to-1 projects with developer-ready design files.",
    h1: "Hire an app designer for your product",
  },
  {
    slug: "ui-ux-design-services",
    keyword: "UI UX design services",
    related: [
      "UI UX designer",
      "user experience design",
      "product UI design USA",
    ],
    serviceSlug: "mobile-app-design",
    title: "UI UX Design Services USA — Product & App Interfaces",
    description:
      "UI UX design services for US startups and product teams. Screen flows, visual systems, and handoff-ready files.",
    h1: "UI UX design services for digital products",
  },
  {
    slug: "packaging-design-services",
    keyword: "packaging design services",
    related: [
      "product packaging design",
      "hire packaging designer",
      "custom packaging design USA",
    ],
    serviceSlug: "product-packaging-design",
    title: "Packaging Design Services USA — Shelf-Ready Creative",
    description:
      "Packaging design services for US CPG and retail brands. Contests deliver multiple pack concepts and print-ready art.",
    h1: "Packaging design services for US brands",
  },
  {
    slug: "branding-agency-usa",
    keyword: "branding agency USA",
    related: [
      "branding company USA",
      "brand identity agency",
      "full service branding USA",
    ],
    serviceSlug: "full-service-branding",
    title: "Branding Agency USA — Identity Systems & Brand Contests",
    description:
      "Branding agency results without the waitlist. Creative Logo Makers delivers identity systems via contests and Studio packs.",
    h1: "Branding agency services for US companies",
  },
  {
    slug: "brand-identity-design",
    keyword: "brand identity design",
    related: [
      "brand identity designer",
      "visual identity design",
      "brand system design",
    ],
    serviceSlug: "full-service-branding",
    title: "Brand Identity Design USA — Logos, Systems & Guidelines",
    description:
      "Brand identity design for US launches — logo, palette, type, and usage systems through contests or Studio.",
    h1: "Brand identity design that scales",
  },
  {
    slug: "graphic-design-services-usa",
    keyword: "graphic design services",
    related: [
      "graphic design company",
      "graphic designer for hire",
      "graphic design USA",
    ],
    serviceSlug: "logo-design",
    title: "Graphic Design Services USA — Logo, Web, Print & More",
    description:
      "Graphic design services across logo, web, packaging, and social. Launch a contest or hire a designer 1-to-1.",
    h1: "Graphic design services for every US channel",
  },
  {
    slug: "design-contest",
    keyword: "design contest",
    related: [
      "logo contest",
      "graphic design contest",
      "design competition",
    ],
    serviceSlug: "logo-design",
    title: "Design Contest USA — Logo, Web & Creative Competitions",
    description:
      "Run a design contest and get dozens of custom concepts. Compare designers, pick a winner, and download final files.",
    h1: "Design contests that deliver options fast",
  },
  {
    slug: "logo-maker-online",
    keyword: "logo maker",
    related: [
      "free logo maker",
      "online logo maker",
      "create a logo online",
      "logo generator",
    ],
    serviceSlug: "logo-design",
    title: "Logo Maker Online USA — Free Concepts + Pro Designer Upgrade",
    description:
      "Use our free logo maker for quick ideas, then upgrade to a real designer contest for a polished custom logo.",
    h1: "Logo maker online — then go pro",
  },
  {
    slug: "best-logo-design-services",
    keyword: "best logo design services",
    related: [
      "top logo design services",
      "best logo designer USA",
      "best logo design company",
    ],
    serviceSlug: "logo-design",
    title: "Best Logo Design Services USA — Contests from $249",
    description:
      "See why US teams choose Creative Logo Makers for best logo design services — multiple concepts, revisions, ownership.",
    h1: "Best logo design services for US brands",
  },
  {
    slug: "ios-app-design-services",
    keyword: "iOS app design",
    related: [
      "iphone app design",
      "iOS UI design services",
      "Apple app design",
    ],
    serviceSlug: "ios-app-design",
    title: "iOS App Design Services USA — iPhone & iPad UI",
    description:
      "iOS app design for US products. Contests and 1-to-1 projects for HIG-friendly iPhone and iPad interfaces.",
    h1: "iOS app design services online",
  },
  {
    slug: "android-app-design-services",
    keyword: "Android app design",
    related: [
      "Android UI design",
      "Material Design app",
      "Google Play app design",
    ],
    serviceSlug: "android-app-design",
    title: "Android App Design Services USA — Material UI Contests",
    description:
      "Android app design services with Material-friendly UI concepts. Contest or hire for production-ready screens.",
    h1: "Android app design for US apps",
  },
  {
    slug: "social-media-design-services",
    keyword: "social media design",
    related: [
      "instagram design services",
      "social media branding",
      "facebook cover design",
    ],
    serviceSlug: "social-media-page-design",
    title: "Social Media Design Services USA — Profiles & Creatives",
    description:
      "Social media design for US brands — page kits, covers, and on-brand graphics via contest or 1-to-1.",
    h1: "Social media design that looks on-brand",
  },
  {
    slug: "flyer-design-services",
    keyword: "flyer design",
    related: [
      "flyer designer",
      "event flyer design",
      "print flyer design USA",
    ],
    serviceSlug: "flyer-design",
    title: "Flyer Design Services USA — Print-Ready Event & Promo Flyers",
    description:
      "Flyer design services for US events and promotions. Multiple concepts and print-ready files.",
    h1: "Flyer design services for campaigns",
  },
  {
    slug: "brochure-design-services",
    keyword: "brochure design",
    related: [
      "brochure designer",
      "company brochure design",
      "tri fold brochure design",
    ],
    serviceSlug: "brochure-design",
    title: "Brochure Design Services USA — Company & Product Brochures",
    description:
      "Brochure design for US businesses — polished layouts ready for print and PDF distribution.",
    h1: "Brochure design that sells your story",
  },
  {
    slug: "business-card-design-services",
    keyword: "business card design",
    related: [
      "custom business cards",
      "professional business card design",
      "visiting card design",
    ],
    serviceSlug: "business-card-design",
    title: "Business Card Design Services USA — Print-Ready Cards",
    description:
      "Professional business card design with print-ready files. Contests and 1-to-1 for US professionals.",
    h1: "Business card design that makes an intro",
  },
  {
    slug: "t-shirt-design-services",
    keyword: "t-shirt design",
    related: [
      "custom t-shirt design",
      "merchandise design",
      "apparel design USA",
    ],
    serviceSlug: "t-shirt-design",
    title: "T-Shirt Design Services USA — Custom Merch Graphics",
    description:
      "Custom t-shirt design for US brands and merch drops. Print-ready graphics via contest or hire.",
    h1: "T-shirt design for merch that sells",
  },
  {
    slug: "book-cover-design-services",
    keyword: "book cover design",
    related: [
      "ebook cover design",
      "hire book cover designer",
      "author book cover",
    ],
    serviceSlug: "book-cover-design",
    title: "Book Cover Design Services USA — Print & Ebook Covers",
    description:
      "Book cover design for US authors and publishers. Multiple covers in a contest — pick a winner.",
    h1: "Book cover design that gets clicked",
  },
  {
    slug: "wordpress-website-design",
    keyword: "WordPress website design",
    related: [
      "WordPress design services",
      "WordPress theme design",
      "hire WordPress designer",
    ],
    serviceSlug: "wordpress-theme-design",
    title: "WordPress Website Design USA — Custom Themes & Layouts",
    description:
      "WordPress website design for US sites — custom theme concepts and layouts ready for development.",
    h1: "WordPress website design services",
  },
  {
    slug: "app-icon-design-services",
    keyword: "app icon design",
    related: [
      "ios app icon design",
      "android app icon",
      "custom app icon",
    ],
    serviceSlug: "app-icon-design",
    title: "App Icon Design Services USA — Store-Ready Icons",
    description:
      "App icon design for iOS and Android store listings. Multiple concepts via contest.",
    h1: "App icon design that stands out",
  },
  {
    slug: "illustration-services-usa",
    keyword: "illustration services",
    related: [
      "custom illustration",
      "hire illustrator USA",
      "commercial illustration",
    ],
    serviceSlug: "illustrations",
    title: "Illustration Services USA — Custom Art for Brands",
    description:
      "Illustration services for US marketing, products, and apps. Contests deliver multiple art directions.",
    h1: "Illustration services for modern brands",
  },
  {
    slug: "brand-guidelines-design",
    keyword: "brand guidelines",
    related: [
      "brand style guide",
      "brand book design",
      "identity guidelines",
    ],
    serviceSlug: "brand-guide",
    title: "Brand Guidelines Design USA — Style Guides & Systems",
    description:
      "Brand guidelines design for US teams — colors, type, logo usage, and consistency rules.",
    h1: "Brand guidelines that keep teams aligned",
  },
  {
    slug: "startup-logo-design",
    keyword: "startup logo design",
    related: [
      "logo for startups",
      "tech startup logo",
      "startup branding",
    ],
    serviceSlug: "logo-design",
    title: "Startup Logo Design USA — Fast Contests for Founders",
    description:
      "Startup logo design built for speed. Launch a contest, compare concepts, and ship your brand mark.",
    h1: "Startup logo design for founders",
  },
  {
    slug: "restaurant-logo-design",
    keyword: "restaurant logo design",
    related: [
      "cafe logo design",
      "food business logo",
      "restaurant branding",
    ],
    serviceSlug: "logo-design",
    title: "Restaurant Logo Design USA — Food & Hospitality Brands",
    description:
      "Restaurant logo design for US food brands — menus, storefronts, and delivery apps covered.",
    h1: "Restaurant logo design that looks delicious",
  },
  {
    slug: "real-estate-logo-design",
    keyword: "real estate logo design",
    related: [
      "realtor logo design",
      "property logo design",
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
    related: [
      "lawyer logo design",
      "attorney logo",
      "legal branding",
    ],
    serviceSlug: "logo-design",
    title: "Law Firm Logo Design USA — Professional Legal Brands",
    description:
      "Law firm logo design for US attorneys — polished, credible identity concepts via contest.",
    h1: "Law firm logo design that signals authority",
  },
];

export function getIntentBySlug(slug: string): UsaIntent | undefined {
  return USA_INTENTS.find((i) => i.slug === slug);
}

export function intentPath(slug: string) {
  return `/usa/${slug}`;
}
