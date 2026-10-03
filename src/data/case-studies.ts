export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  location: string;
  service: string;
  servicePath: string;
  summary: string;
  challenge: string;
  approach: string;
  results: string[];
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  quote: string;
  quoteName: string;
  quoteRole: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "black-ring-coffee-rebrand",
    title: "Black Ring Coffee: from generic cup to shelf-ready brand",
    client: "Black Ring Coffee",
    industry: "Food & beverage",
    location: "USA",
    service: "Logo + packaging",
    servicePath: "/product-packaging-design/details",
    summary:
      "A US coffee brand needed a mark and cup system that stood out in delivery apps and on the counter — without looking like every other bean logo.",
    challenge:
      "The previous mark was hard to embroider, muddy at thumbnail size, and inconsistent across cups, sleeves, and Instagram.",
    approach:
      "Contest concepts explored bold geometry and roast personality, then packaging and sleeve layouts locked a one-color print system for high-volume cups.",
    results: [
      "Clearer brand recognition on delivery-app thumbnails",
      "Print-ready cup and sleeve files for US vendors",
      "Consistent social avatars and story templates",
    ],
    beforeImage: "/clm/unique/pricing-desk.jpg",
    afterImage: "/showcase/coffee.jpg",
    beforeAlt: "Before: inconsistent coffee brand materials",
    afterAlt: "After: cohesive coffee branding and packaging",
    quote:
      "We wanted something fun that didn’t look like every other coffee logo — and we got options we could actually produce.",
    quoteName: "Juliette Simpkins",
    quoteRole: "Owner, Black Ring Coffee",
  },
  {
    slug: "saas-startup-logo-app-icon",
    title: "US SaaS startup: logo that survives the app icon grid",
    client: "Orbit Apps",
    industry: "Software / SaaS",
    location: "United States",
    service: "Logo design",
    servicePath: "/logo-design/details",
    summary:
      "A seed-stage product needed a mark that worked in dark-mode UI, slide decks, and 32×32 favicons before the next fundraise.",
    challenge:
      "Early DIY marks fell apart in the App Store grid and looked different on every landing page mock.",
    approach:
      "Icon-first exploration, monochrome lockups for invoices, and a simple brand guide so engineers and marketers stayed aligned.",
    results: [
      "App icon and nav mark from one geometry system",
      "Deck-ready wordmark for investor updates",
      "Faster handoff to the marketing site redesign",
    ],
    beforeImage: "/clm/hires/design-workspace.jpg",
    afterImage: "/clm/unique/mobile-app.jpg",
    beforeAlt: "Before: cluttered early startup mark concepts",
    afterAlt: "After: clean SaaS logo and app UI mark",
    quote:
      "We finally have a mark that looks intentional in the product — not just on a pitch slide.",
    quoteName: "Sam Ortiz",
    quoteRole: "Founder, Orbit Apps",
  },
  {
    slug: "dtc-packaging-amazon-ready",
    title: "DTC brand packaging that wins the Amazon thumbnail",
    client: "Pulse Health",
    industry: "CPG / wellness",
    location: "USA",
    service: "Packaging design",
    servicePath: "/product-packaging-design/details",
    summary:
      "A wellness SKU needed packaging that sold in a photo, survived shipping, and stayed compliant on claims hierarchy.",
    challenge:
      "Pretty studio comps failed in crushed shippers and unreadable on phone-sized Amazon results.",
    approach:
      "Thumbnail-first hierarchy, ship-safe finishes, and a label system that left legal panels clean for US retail.",
    results: [
      "Stronger contrast at Amazon search size",
      "Vendor-ready dielines and print specs",
      "Unboxing insert path into email capture",
    ],
    beforeImage: "/clm/unique/pack-shelf.jpg",
    afterImage: "/clm/unique/svc-food-pack.jpg",
    beforeAlt: "Before: busy packaging hard to read at small size",
    afterAlt: "After: clear DTC packaging hierarchy",
    quote:
      "Our box finally looks like the brand we paid to build — in the feed and on the doorstep.",
    quoteName: "Priya Nair",
    quoteRole: "Head of Brand, Pulse Health",
  },
  {
    slug: "local-service-website-leads",
    title: "Local US service company: landing page that converts ads",
    client: "Northwind Home Services",
    industry: "Home services",
    location: "United States",
    service: "Landing page design",
    servicePath: "/landing-page-design/details",
    summary:
      "Paid search traffic was expensive; the homepage said everything and converted almost nothing.",
    challenge:
      "Message mismatch between ads and the page, weak proof, and too many competing CTAs above the fold.",
    approach:
      "Ad-matched headline, city-relevant proof, single primary CTA, and mobile LCP-friendly hero treatment.",
    results: [
      "Clearer lead form completion path on mobile",
      "Proof and trust cues near the buy/contact action",
      "Reusable section system for seasonal offers",
    ],
    beforeImage: "/clm/unique/web-ui.jpg",
    afterImage: "/clm/unique/landing-ui.jpg",
    beforeAlt: "Before: cluttered service company homepage",
    afterAlt: "After: focused landing page layout",
    quote:
      "We stopped sending ad traffic to a brochure site. The new page asks for one thing — and gets it.",
    quoteName: "Jordan Blake",
    quoteRole: "Marketing Lead, Northwind",
  },
  {
    slug: "author-kdp-cover-refresh",
    title: "KDP author cover refresh that reads at thumbnail size",
    client: "Vista Retail Press",
    industry: "Publishing",
    location: "USA",
    service: "Book cover design",
    servicePath: "/book-cover-design/details",
    summary:
      "A self-published title looked polished in a full-size mock and invisible in Amazon search results.",
    challenge:
      "Low contrast typography and genre cues that did not match reader expectations in the US market.",
    approach:
      "Grayscale thumbnail tests, genre-aligned palette, and title hierarchy built for phone grids first.",
    results: [
      "Higher contrast title at Amazon thumbnail size",
      "Genre-clear visual cues without cloning bestsellers",
      "Print + ebook wrap files ready for KDP",
    ],
    beforeImage: "/clm/unique/book-stack.jpg",
    afterImage: "/showcase/book.jpg",
    beforeAlt: "Before: low-contrast book cover mock",
    afterAlt: "After: thumbnail-ready book cover design",
    quote:
      "We approved the cover only after it still worked the size of a postage stamp. That changed everything.",
    quoteName: "Elena Vargas",
    quoteRole: "Author / Publisher",
  },
  {
    slug: "fitness-studio-merch-system",
    title: "Fitness studio: logo-to-locker-room merch system",
    client: "Indie Cafe Athletics",
    industry: "Fitness",
    location: "United States",
    service: "Logo + apparel",
    servicePath: "/t-shirt-design/details",
    summary:
      "A growing gym needed a bold identity that still embroidered cleanly and sold on event tees.",
    challenge:
      "Script logos looked powerful in Illustrator and turned to mud on moisture-wicking fabric.",
    approach:
      "Two-color event tee system, embroidery-safe mark, and social templates for trainer content.",
    results: [
      "Embroidery and screen-print ready lockups",
      "Merch that matches Instagram Reels branding",
      "Simple kit trainers can use without a designer on call",
    ],
    beforeImage: "/clm/parent-categories/clothing-05.png",
    afterImage: "/clm/parent-categories/clothing-01.png",
    beforeAlt: "Before: apparel mock without brand system",
    afterAlt: "After: fitness merch and logo apparel system",
    quote:
      "Our shirts finally look like the energy of the room — and the logo still reads after a wash.",
    quoteName: "Chris Hale",
    quoteRole: "Owner, Indie Cafe Athletics",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
