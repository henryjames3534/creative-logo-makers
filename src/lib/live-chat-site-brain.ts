/**
 * Website-trained live chat brain for Creative Logo Makers.
 * English-only Q&A grounded in real site offers (packages, contests, Studio, USA).
 */

import { PACKAGE_DISCOUNT_PERCENT } from "@/data/packages";
import { brand } from "@/data/site";
import { nap, napAddressLine } from "@/data/nap";

export type SiteChatQa = {
  id: string;
  /** Lowercase English match phrases */
  questions: string[];
  answer: string;
};

/** Compact facts injected into the AI system prompt. */
export function buildLiveChatSystemPrompt(): string {
  return `You are the official English-language live chat assistant for Creative Logo Makers (${brand.url}).

RULES:
- Reply ONLY in clear, natural English (US). Never use Urdu, Hindi, Roman Urdu, or other languages.
- Be concise (2–5 short sentences). Be helpful, warm, and accurate.
- Only answer from the SITE FACTS below. If unsure, ask one clarifying question or suggest /contact or starting a contest at /get-started.
- Do not invent discounts, guarantees, or legal claims beyond the facts.
- Prefer linking paths on the site (e.g. /logo-design/details, /pricing, /contests, /projects, /studio).
- Never claim you are a human; you may say you are Creative Logo Makers support chat.
- If the visitor wants a human, tell them a team member can join shortly.

SITE FACTS:
- Company: ${nap.name}, USA HQ ${napAddressLine()}, phone ${nap.phoneDisplay}, email ${nap.email}.
- What we sell: custom logo design, web/UI design, packaging, branding, merch, book covers, social graphics, and more via design contests or 1-to-1 hire. Studio offers brand strategy and full identity.
- How it works: (1) Share a brief (2) Choose contest (many designers) or 1-to-1 (3) Review & revise (4) Download final files with commercial use.
- Contests: multiple designers submit concepts; client picks a winner. Packages usually Bronze / Silver / Gold / Platinum.
- LIVE OFFER (must mention on any price question): sitewide package sale is ON — ${PACKAGE_DISCOUNT_PERCENT}% off list prices. Logo contest Bronze starts about $75 (was $249). Always state both the sale % and the sale starting price; never quote only the old $249 as if it were the current price.
- Sale prices appear next to struck-through list prices on package cards (/logo-design/details, /pricing, category details pages).
- Logo design starts from contest packages (see /logo-design/details). Web and app design have higher tiers (see /web-design/details, /mobile-app-design/details).
- Ownership: completed winning work is delivered for commercial business use (confirm package terms on the order page).
- USA SEO/help pages live under /usa and /us. Blog at /blog. Case studies at /case-studies. Contact at /contact.
- Support agents may take over this chat; when that happens you stop replying.
`;
}

/** High-precision local answers when AI API key is not configured. */
export const SITE_CHAT_QA: SiteChatQa[] = [
  {
    id: "greeting",
    questions: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "anyone there",
      "is anyone online",
    ],
    answer:
      "Hi! Welcome to Creative Logo Makers. I can help with logos, websites, packaging, branding, contests, or pricing — in English. What are you looking to create?",
  },
  {
    id: "logo_price",
    questions: [
      "logo price",
      "logo cost",
      "how much for a logo",
      "logo pricing",
      "price of logo design",
      "logo design cost",
      "cheap logo",
      "affordable logo",
      "logo rate",
      "logo rates",
      "price logo",
      "cost logo",
      "how much logo",
      "logo kitna",
      "rates for logo",
      "logo package price",
      "starting price logo",
    ],
    answer: `Yes — our package sale is live right now: ${PACKAGE_DISCOUNT_PERCENT}% off. Logo design contest packages start from about $75 (was $249). Higher tiers add more concepts and designers. See /logo-design/details or start at /get-started.`,
  },
  {
    id: "general_price",
    questions: [
      "price",
      "pricing",
      "how much",
      "cost",
      "rates",
      "rate",
      "package price",
      "packages price",
      "what are your rates",
      "what is the price",
      "starting price",
    ],
    answer: `We have a live package offer: ${PACKAGE_DISCOUNT_PERCENT}% off list prices. Contest packages for logo-style work start from about $75 (was $249) — sale price shows on each package card. Tell me logo, website, packaging, or branding and I will point you to the right page.`,
  },
  {
    id: "logo_services",
    questions: [
      "logo design services",
      "need a logo",
      "custom logo",
      "logo designer",
      "hire logo designer",
      "logo design company",
      "logo design agency",
    ],
    answer:
      "Yes — we offer custom logo design services through contests (many designers) or 1-to-1 hire. You get concepts, revisions, and commercial files. Start here: /logo-design/details or /usa/logo-design-services.",
  },
  {
    id: "website_price",
    questions: [
      "website price",
      "web design cost",
      "how much website",
      "website design pricing",
      "landing page cost",
    ],
    answer: `Website and landing-page packages are on sale too — ${PACKAGE_DISCOUNT_PERCENT}% off list prices (sale price shown on each card). See /web-design/details or /landing-page-design/details. Tell me if you need a full site or a single landing page.`,
  },
  {
    id: "contest_vs_project",
    questions: [
      "contest",
      "design contest",
      "one to one",
      "1 to 1",
      "hire one designer",
      "difference between contest and project",
    ],
    answer:
      "A design contest gets you multiple concepts from different designers — great when you want options. A 1-to-1 project is a private collaboration with one designer. Both end with revisions and final files. Compare at /contests and /projects.",
  },
  {
    id: "how_it_works",
    questions: [
      "how it works",
      "how does it work",
      "process",
      "what is the process",
      "steps",
    ],
    answer:
      "Quick process: share your brief → choose contest or 1-to-1 → review concepts and request changes → download production-ready files. Details: /how-it-works and /process.",
  },
  {
    id: "turnaround",
    questions: [
      "how long",
      "turnaround",
      "delivery time",
      "when will i get",
      "timeline",
      "how fast",
    ],
    answer:
      "Most contests start receiving concepts within days. Total time depends on your package, how quickly you give feedback, and revision rounds. Share your deadline in the brief and we will help you plan.",
  },
  {
    id: "ownership",
    questions: [
      "do i own",
      "copyright",
      "ownership",
      "source files",
      "commercial use",
    ],
    answer:
      "When your project completes and the winning design is transferred, you receive the final files for commercial business use, including source files on standard packages. Confirm the exact terms on your package page before checkout.",
  },
  {
    id: "packaging",
    questions: [
      "packaging",
      "label design",
      "product packaging",
      "box design",
    ],
    answer:
      "Yes — we design product packaging and labels for US DTC and retail brands. See /product-packaging-design/details or /usa/packaging-design-services.",
  },
  {
    id: "branding",
    questions: [
      "brand identity",
      "branding agency",
      "brand strategy",
      "rebranding",
      "full branding",
    ],
    answer:
      "We handle brand identity and strategy via contests plus Creative Logo Makers Studio for fuller systems. Explore /studio, /usa/brand-identity-agency, and /usa/brand-strategy-agency.",
  },
  {
    id: "sale_discount",
    questions: [
      "discount",
      "sale",
      "70% off",
      "70 percent",
      "promo",
      "coupon",
    ],
    answer: `Yes — the offer is live: ${PACKAGE_DISCOUNT_PERCENT}% off package list prices sitewide. Logo contest packages start from about $75 (was $249). You will see the sale price next to the struck-through list price on every package card.`,
  },
  {
    id: "contact",
    questions: [
      "phone",
      "email",
      "address",
      "contact",
      "talk to human",
      "speak to agent",
      "real person",
    ],
    answer: `You can reach us at ${nap.phoneDisplay} or ${nap.email}. HQ: ${napAddressLine()}, USA. Or use /contact. If you want a human in this chat, stay online — a team member can take over.`,
  },
  {
    id: "payment",
    questions: [
      "payment",
      "pay",
      "refund",
      "money back",
      "guarantee",
    ],
    answer:
      "Packages are prepaid contest or project fees in USD. Money-back / guarantee details are listed on the package terms for each service — check the order page before you start. Policies hub: /policies.",
  },
  {
    id: "usa",
    questions: [
      "united states",
      "usa",
      "america",
      "us business",
      "near me",
    ],
    answer:
      "We serve US businesses nationwide with remote delivery, English support, and USD pricing. Browse city pages under /us or keyword pages under /usa.",
  },
];

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%$+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Best local English answer from the site brain (0 if weak match). */
export function matchSiteChatAnswer(visitorMessage: string): {
  answer: string;
  score: number;
  id: string;
} | null {
  const text = normalize(visitorMessage);
  if (!text) return null;

  let best: { answer: string; score: number; id: string } | null = null;
  for (const row of SITE_CHAT_QA) {
    let score = 0;
    for (const q of row.questions) {
      const needle = q.toLowerCase();
      if (text === needle) score = Math.max(score, 120);
      else if (text.includes(needle)) score = Math.max(score, 50 + needle.length);
      else {
        const tokens = needle.split(" ").filter((t) => t.length > 2);
        if (!tokens.length) continue;
        const hits = tokens.filter((t) => text.includes(t)).length;
        const ratio = hits / tokens.length;
        if (ratio >= 0.7) score = Math.max(score, Math.round(25 + ratio * 30));
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { answer: row.answer, score, id: row.id };
    }
  }
  if (!best || best.score < 28) return null;
  return best;
}
