/**
 * Multi-turn live-chat conversation engine.
 * Uses current message + recent history so short follow-ups like "pricing"
 * still resolve to the right package / service answer.
 */

import {
  PACKAGE_DISCOUNT_PERCENT,
  applyPackageDiscount,
  getContestPackages,
} from "@/data/packages";

export type ChatHistoryItem = {
  role: "visitor" | "bot" | "admin";
  body: string;
};

type ServiceKey =
  | "logo"
  | "website"
  | "packaging"
  | "branding"
  | "business-card"
  | "social"
  | "general";

type TierKey = "bronze" | "silver" | "gold" | "platinum";

type IntentKey =
  | "price"
  | "start"
  | "turnaround"
  | "contest"
  | "hire"
  | "discount"
  | "package"
  | "greeting"
  | "human"
  | "unknown";

type DialogState = {
  service: ServiceKey;
  tier: TierKey | null;
  intent: IntentKey;
  path?: string;
};

const SERVICE_SLUG: Record<ServiceKey, string> = {
  logo: "logo-design",
  website: "web-design",
  packaging: "product-packaging-design",
  branding: "brand-identity-pack",
  "business-card": "business-card-design",
  social: "social-media-pack",
  general: "logo-design",
};

const SERVICE_LABEL: Record<ServiceKey, string> = {
  logo: "logo design",
  website: "website design",
  packaging: "packaging design",
  branding: "branding",
  "business-card": "business card design",
  social: "social media design",
  general: "design",
};

const SERVICE_PATH: Record<ServiceKey, string> = {
  logo: "/logo-design/details",
  website: "/web-design/details",
  packaging: "/product-packaging-design/details",
  branding: "/branding/details",
  "business-card": "/business-card-design/details",
  social: "/social-media-design/details",
  general: "/pricing",
};

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%$+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectService(text: string): ServiceKey | null {
  if (/\b(website|web design|landing page|homepage|web site)\b/.test(text))
    return "website";
  if (/\b(packaging|label design|product pack|box design|pouch)\b/.test(text))
    return "packaging";
  if (/\b(branding|brand identity|brand kit|rebrand|style guide)\b/.test(text))
    return "branding";
  if (/\b(business card|visiting card|stationery)\b/.test(text))
    return "business-card";
  if (/\b(social media|instagram|facebook cover|banner ad)\b/.test(text))
    return "social";
  if (/\b(logo|logotype|wordmark|brand mark|emblem)\b/.test(text)) return "logo";
  // "basic/bronze package" with no other service → logo (most common entry)
  if (
    /\b(basic|starter|cheapest|lowest|entry|bronze)\b/.test(text) &&
    /\bpackage\b/.test(text)
  ) {
    return "logo";
  }
  if (/\bpackage\b/.test(text) && !/\b(1\s*-?\s*to\s*-?\s*1|hire)\b/.test(text))
    return "logo";
  return null;
}

function detectTier(text: string): TierKey | null {
  if (/\b(platinum|premium|enterprise)\b/.test(text)) return "platinum";
  if (/\b(gold|best value|most popular)\b/.test(text)) return "gold";
  if (/\b(silver|mid|standard)\b/.test(text)) return "silver";
  if (
    /\b(bronze|basic|starter|cheapest|lowest|entry level|entry-level|cheap package)\b/.test(
      text,
    )
  ) {
    return "bronze";
  }
  return null;
}

function detectIntent(text: string): IntentKey {
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|salam|yo|hola)$/.test(
      text,
    )
  ) {
    return "greeting";
  }
  if (
    /\b(human|real person|agent|talk to|speak to|call me|whatsapp)\b/.test(text)
  ) {
    return "human";
  }
  if (
    /\b(70\s*%|discount|sale|offer|promo|coupon|off chal|kitna off)\b/.test(
      text,
    )
  ) {
    return "discount";
  }
  if (
    /\b(price|pricing|cost|rate|rates|how much|budget|fee|charges|kitna)\b/.test(
      text,
    )
  ) {
    return "price";
  }
  if (
    /\b(turnaround|how long|timeline|deadline|delivery|eta|days|fast)\b/.test(
      text,
    )
  ) {
    return "turnaround";
  }
  if (/\b(contest|competition|multiple designers)\b/.test(text)) {
    return "contest";
  }
  if (/\b(1\s*-?\s*to\s*-?\s*1|one on one|hire|dedicated designer)\b/.test(text)) {
    return "hire";
  }
  if (
    /\b(start|get started|begin|order|buy|purchase|launch|sign up)\b/.test(text)
  ) {
    return "start";
  }
  if (/\b(package|packages|tier|bronze|silver|gold|platinum|basic)\b/.test(text)) {
    return "package";
  }
  if (/\b(need|want|looking for|do you do|interested)\b/.test(text)) {
    return "package";
  }
  return "unknown";
}

function historyBlob(history: ChatHistoryItem[]): string {
  return history
    .slice(-12)
    .map((h) => normalize(h.body))
    .filter(Boolean)
    .join(" \n ");
}

function lastBotAskedClarify(history: ChatHistoryItem[]): boolean {
  const lastBot = [...history].reverse().find((h) => h.role === "bot");
  if (!lastBot) return false;
  return /pricing, turnaround, contests, or hiring|what are you looking|tell me your project|share a bit more/i.test(
    lastBot.body,
  );
}

function inferState(
  message: string,
  history: ChatHistoryItem[] = [],
  path?: string,
): DialogState {
  const text = normalize(message);
  const prior = historyBlob(history);
  const combined = `${prior} ${text}`.trim();

  let service =
    detectService(text) || detectService(combined) || detectService(normalize(path || ""));
  if (!service && /\/logo-design|logo-maker/i.test(path || "")) service = "logo";
  if (!service && /web-design|landing-page/i.test(path || "")) service = "website";
  if (!service) service = "general";

  const tier = detectTier(text) || detectTier(combined);
  let intent = detectIntent(text);

  // Short follow-ups after a clarify prompt
  if (
    lastBotAskedClarify(history) &&
    /^(pricing|price|cost|rates?|turnaround|contests?|hiring|designer|logo|website|packaging|branding)$/.test(
      text,
    )
  ) {
    if (/pricing|price|cost|rates?/.test(text)) intent = "price";
    else if (/turnaround/.test(text)) intent = "turnaround";
    else if (/contest/.test(text)) intent = "contest";
    else if (/hiring|designer/.test(text)) intent = "hire";
    else if (/logo|website|packaging|branding/.test(text)) intent = "package";
  }

  // "basic package" / tier mentions without explicit price word → package pricing
  if (
    (intent === "unknown" || intent === "package") &&
    (tier || /\bpackage\b/.test(text))
  ) {
    intent = "price";
  }

  // If they only said "pricing" and prior mentioned a package/service, keep price
  if (intent === "price" || intent === "package" || intent === "discount") {
    /* keep */
  } else if (
    intent === "unknown" &&
    (detectTier(combined) || /\bpackage\b/.test(combined))
  ) {
    intent = "price";
  }

  return { service, tier, intent, path };
}

function tierPrices(service: ServiceKey) {
  const packs = getContestPackages(SERVICE_SLUG[service]);
  const byId = (id: TierKey) => packs.find((p) => p.id === id);
  return {
    bronze: byId("bronze"),
    silver: byId("silver"),
    gold: byId("gold"),
    platinum: byId("platinum"),
  };
}

function saleLine(service: ServiceKey, tier: TierKey | null): string {
  const prices = tierPrices(service);
  const label = SERVICE_LABEL[service];
  const path = SERVICE_PATH[service];
  const sale = PACKAGE_DISCOUNT_PERCENT;

  if (tier) {
    const pack = prices[tier];
    const salePrice = pack?.price ?? applyPackageDiscount("$249");
    const list = pack?.compareAtPrice ?? "$249";
    const name = pack?.name ?? "Bronze";
    return `Yes — our ${sale}% off package sale is live. The ${name} (basic) contest package for ${label} is ${salePrice} (was ${list}). See ${path} or start at /get-started.`;
  }

  const bronze = prices.bronze;
  return `Yes — package sale is live: ${sale}% off. For ${label}, contest packages start from ${bronze?.price ?? "$75"} (was ${bronze?.compareAtPrice ?? "$249"}). Tiers: Bronze → Silver → Gold → Platinum. Details: ${path}`;
}

function buildReply(state: DialogState): string | null {
  const { service, tier, intent } = state;
  const label = SERVICE_LABEL[service];
  const path = SERVICE_PATH[service];
  const sale = PACKAGE_DISCOUNT_PERCENT;
  const prices = tierPrices(service);
  const bronze = prices.bronze;

  switch (intent) {
    case "greeting":
      return `Hi! Welcome to Creative Logo Makers. Quick heads-up: our ${sale}% off package sale is live — ${label === "design" ? "logo contests" : label} from ${bronze?.price ?? "$75"} (was ${bronze?.compareAtPrice ?? "$249"}). What do you need: logo, website, packaging, or branding?`;

    case "discount":
      return `Yes — the offer is running now: ${sale}% off package list prices sitewide. Logo/basic contest packages start from ${bronze?.price ?? "$75"} (was $249). Sale price shows next to the struck-through list price on every package card.`;

    case "price":
    case "package":
      return saleLine(service, tier);

    case "start":
      return `Easy: open ${path}, pick a contest package (Bronze is the basic tier — on sale at ${bronze?.price ?? "$75"}), fill a short brief, and designers start submitting. Or go to /get-started and I can stay here if you get stuck.`;

    case "turnaround":
      return `For ${label}, contests usually start getting concepts within a few days. Total time depends on your package and how fast you give feedback. Share your deadline and we will plan around it.`;

    case "contest":
      return `A ${label} contest gets you multiple designers and concepts so you can compare and pick a winner. Basic tier is Bronze — currently ${bronze?.price ?? "$75"} with our ${sale}% off sale (was ${bronze?.compareAtPrice ?? "$249"}). Start at ${path}.`;

    case "hire":
      return `You can also hire 1-to-1 for ${label} if you want one dedicated designer. Contest packages are best when you want more options — and the ${sale}% off sale applies on contest package cards. Browse /projects or ${path}.`;

    case "human":
      return `Absolutely — stay online and a team member can take over this chat shortly. You can also reach us via /contact.`;

    default:
      return null;
  }
}

/**
 * Advanced multi-turn reply. Returns null only when we truly lack signal
 * (then caller may try AI / soft clarify — never the same loop twice).
 */
export function resolveConversationalReply(
  message: string,
  history: ChatHistoryItem[] = [],
  path?: string,
): { body: string; source: "conversation"; state: DialogState } | null {
  const text = normalize(message);
  if (!text) return null;

  const state = inferState(message, history, path);
  const direct = buildReply(state);
  if (direct) {
    return { body: direct, source: "conversation", state };
  }

  // After a clarify loop, never ask the same question again — default to sale pricing
  if (lastBotAskedClarify(history)) {
    return {
      body: saleLine(state.service, state.tier),
      source: "conversation",
      state: { ...state, intent: "price" },
    };
  }

  // Soft, useful clarify (only once) — still mentions the live sale
  if (state.intent === "unknown") {
    const sale = PACKAGE_DISCOUNT_PERCENT;
    const bronze = tierPrices(state.service).bronze;
    return {
      body: `I can help right away. Our package sale is live (${sale}% off — basic/Bronze from ${bronze?.price ?? "$75"}, was $249). Are you after pricing for a logo, website, packaging, or branding — or do you want to start a contest?`,
      source: "conversation",
      state: { ...state, intent: "price" },
    };
  }

  return null;
}
