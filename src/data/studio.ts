export type StudioService = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  price: string;
  turnaround: string;
  icon: "strategy" | "identity" | "launch" | "call";
  badge?: string;
  highlights: string[];
  includes: string[];
  process: { step: string; title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

/** Circlemakers Studio / Creative Logo Makers Studio catalog (local) */
export const studioServices: StudioService[] = [
  {
    slug: "brand-strategy",
    title: "Brand strategy",
    shortTitle: "Brand strategy",
    eyebrow: "Studio · Strategy",
    description:
      "Positioning, messaging, and naming — workshops that turn your business idea into a clear brand story using frameworks like StoryBrand™.",
    price: "From $1,999",
    turnaround: "2–4 weeks",
    icon: "strategy",
    badge: "Core",
    highlights: [
      "Dedicated Brand Strategist",
      "StoryBrand™ messaging framework",
      "Naming & tagline options",
      "Audience, mission & differentiators",
    ],
    includes: [
      "Brand workshop (positioning, audience, values, tone)",
      "Messaging structure that connects to your customer",
      "Optional brand or product naming (up to 10 names + 3 taglines)",
      "Google, WIPO & domain checks on naming shortlist",
      "Messaging framework ready for your brand guide",
      "Strategist-led reviews and next-step recommendations",
    ],
    process: [
      {
        step: "01",
        title: "Discovery workshop",
        body: "We clarify goals, audience, competitors, and what makes you different.",
      },
      {
        step: "02",
        title: "Positioning & messaging",
        body: "Using StoryBrand™, we craft a messaging structure your team can reuse.",
      },
      {
        step: "03",
        title: "Naming (optional)",
        body: "Explore constructs and themes, then present viable names with taglines.",
      },
      {
        step: "04",
        title: "Handoff",
        body: "You leave with a clear brand story ready for identity and launch work.",
      },
    ],
    faqs: [
      {
        q: "Can you help with brand messaging only?",
        a: "Yes. Messaging packages start at US$2,999 and include a workshop plus a messaging framework for your brand guide.",
      },
      {
        q: "Do you offer naming on its own?",
        a: "Yes. Brand or product naming starts at US$1,999 — up to 10 names, 3 taglines, and basic trademark/domain checks.",
      },
    ],
  },
  {
    slug: "full-brand-identity",
    title: "Full brand identity",
    shortTitle: "Full brand identity",
    eyebrow: "Studio · Identity",
    description:
      "Full-service logo & brand pack — from discovery and curated logo concepts through brand guidelines, cards, and digital assets.",
    price: "From $4,499",
    turnaround: "4–6 weeks",
    icon: "identity",
    highlights: [
      "9 curated logo concepts",
      "Finalized custom logo",
      "Brand guide + applications",
      "End-to-end Brand Strategist",
    ],
    includes: [
      "1-hour brand discovery session",
      "9 curated logo concepts",
      "1 finalized custom logo design",
      "2× brand development concepts",
      "Comprehensive brand guide",
      "LinkedIn banner & post",
      "Business card design",
      "Branded Word / Google Doc",
      "2× 30-minute status calls",
      "1-hour brand design aftercare",
      "Full copyright ownership of final files",
    ],
    process: [
      {
        step: "01",
        title: "Discovery",
        body: "Your strategist sets direction for the brief and creative recruitment.",
      },
      {
        step: "02",
        title: "Logo concepting",
        body: "Review curated concepts from vetted creatives, then refine a winner.",
      },
      {
        step: "03",
        title: "Brand development",
        body: "Color, type, visual elements, and guidelines built around your logo.",
      },
      {
        step: "04",
        title: "Applications & aftercare",
        body: "Social, cards, docs, and a handoff session so your team can apply the brand.",
      },
    ],
    faqs: [
      {
        q: "What does the Full-Service Brand Pack cost?",
        a: "It starts at US$4,499. Custom scopes and add-ons (messaging, naming, illustration) are quoted separately.",
      },
      {
        q: "Is there a money-back guarantee?",
        a: "Studio is an independent agency partnership — the contest money-back guarantee does not apply. Projects follow the agreed payment structure if canceled.",
      },
    ],
  },
  {
    slug: "launch-packages",
    title: "Launch packages",
    shortTitle: "Launch packages",
    eyebrow: "Studio · Launch",
    description:
      "Everything you need for day one — brand development for an existing logo, launch kits, decks, websites, and print/packaging.",
    price: "From $2,499",
    turnaround: "3–5 weeks",
    icon: "launch",
    highlights: [
      "Brand development pack from $2,499",
      "Guidelines + visual system",
      "Optional decks, web & packaging",
      "Bundled for go-to-market",
    ],
    includes: [
      "Brand Development Pack (logo → cohesive identity) from US$2,499",
      "2× visual concepts before locking direction",
      "Color story, fonts, visual elements & brand guidelines",
      "Optional investor & sales deck design",
      "Optional B2B website (Squarespace, Wix or WordPress)",
      "Optional print & packaging for market launch",
      "Strategist coordination across creatives",
    ],
    process: [
      {
        step: "01",
        title: "Scope your launch",
        body: "Pick development-only, or bundle web, decks, and packaging.",
      },
      {
        step: "02",
        title: "Visual system",
        body: "Senior brand designers extend your logo into a usable identity.",
      },
      {
        step: "03",
        title: "Launch assets",
        body: "Guidelines plus the collateral you need for day-one go-to-market.",
      },
      {
        step: "04",
        title: "Rollout support",
        body: "Handoff so your team (or Studio) can keep applying the brand.",
      },
    ],
    faqs: [
      {
        q: "I already have a logo — can Studio still help?",
        a: "Yes. The Brand Development Pack (from US$2,499) builds color, type, elements, and guidelines around a logo you already love.",
      },
      {
        q: "Can launch work include a website?",
        a: "Yes. Studio specializes in B2B sites — copy wireframes, design, and builds in Squarespace, Wix, or WordPress.",
      },
    ],
  },
  {
    slug: "talk-to-strategist",
    title: "Talk to a strategist",
    shortTitle: "Talk to a strategist",
    eyebrow: "Studio · Intro call",
    description:
      "Book a free discovery call with a Brand Strategist — packages, custom proposals, or a 1-hour coaching review of work you already have.",
    price: "Free intro",
    turnaround: "Usually within 1–2 days",
    icon: "call",
    badge: "New",
    highlights: [
      "Free discovery call",
      "Custom proposal if needed",
      "Optional 1-hr coaching ($200)",
      "English & German",
    ],
    includes: [
      "Free intro call to map goals and recommend a package",
      "Walkthrough of Full-Service, Development, messaging & naming options",
      "Custom quote when your scope is outside standard packs",
      "Optional 1-hour brand coaching call (US$200) to review existing designs",
      "Follow-up summary of recommended next steps",
    ],
    process: [
      {
        step: "01",
        title: "Tell us your needs",
        body: "Share stage, timeline, and whether you need strategy, identity, or launch.",
      },
      {
        step: "02",
        title: "Meet a strategist",
        body: "Laura, Eva, or a teammate walks through fit and package options.",
      },
      {
        step: "03",
        title: "Proposal",
        body: "You get a clear package or custom quote — no pressure to commit on the call.",
      },
      {
        step: "04",
        title: "Kickoff",
        body: "Once you book, your strategist leads discovery and creative recruitment.",
      },
    ],
    faqs: [
      {
        q: "Who will I speak with?",
        a: "Circlemakers Studio Brand Strategists — including leaders like Laura Yogi (San Francisco) and Eva Missling (Berlin).",
      },
      {
        q: "What languages do you support?",
        a: "Currently English and German.",
      },
    ],
  },
];

export function getStudioService(slug: string) {
  return studioServices.find((s) => s.slug === slug);
}

export const studioStrategists = [
  {
    name: "Laura Yogi",
    location: "San Francisco",
    bio: "A decade in global design agencies before leading marketing at Creative Logo Makers. Translates client goals into brand stories that work.",
    image: "/clm/studio-laura.jpeg",
  },
  {
    name: "Eva Missling",
    location: "Berlin",
    bio: "Entrepreneur and designer — founded 12designer (later sold to Creative Logo Makers) after a decade in digital agencies.",
    image: "/clm/hires/creative-team.jpg",
  },
];

export const studioHubFaqs = [
  {
    q: "Who are Circlemakers Studio?",
    a: "An independent brand agency partnered with Creative Logo Makers. They've built brands inside global agencies, in-house teams, and platforms like Creative Logo Makers.",
  },
  {
    q: "What makes Studio packages different?",
    a: "Every package is led end-to-end by a Brand Strategist — brief direction, creative recruitment, brand application, and final deliverables.",
  },
  {
    q: "How much does Studio cost?",
    a: "The Full-Service Brand Pack starts at US$4,499. Brand Development from US$2,499. Naming from US$1,999. Messaging from US$2,999.",
  },
  {
    q: "How long do projects take?",
    a: "Typically 4–6 weeks for the Full-Service Brand Pack, depending on complexity and stakeholder decisions.",
  },
];
