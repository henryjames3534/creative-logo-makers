import type { UsaIntent } from "@/data/usa-intents";

export type UsaKeywordCopy = {
  intro: string;
  bullets: string[];
  howItWorks: string;
  faqs: { question: string; answer: string }[];
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic, non-generic copy for USA keyword pages. */
export function buildUsaKeywordCopy(
  intent: UsaIntent,
  price: string,
  productName: string,
): UsaKeywordCopy {
  const kw = intent.keyword;
  const k = kw.toLowerCase();
  const n = hash(k);
  const near = k.includes("near me");
  const hire = k.includes("hire");
  const cheap = /cheap|affordable|budget|inexpensive/.test(k);
  const agency = /agency|company|firm|services/.test(k);

  const intros = [
    `If you typed “${kw}” into Google, you probably want options fast — not a two-week discovery deck. Creative Logo Makers runs contests so multiple designers respond to one brief, or you can hire one person 1-to-1.`,
    `US teams searching “${kw}” usually care about three things: clear pricing, commercial file ownership, and designers who actually read the brief. That’s the lane we built for.`,
    `“${kw}” shouldn’t mean gambling on a random freelancer profile. Here you pick a package, publish a brief, and compare real concepts before you commit.`,
  ];

  const bulletSets = [
    [
      `${productName} contests start from ${price} (sale pricing shown on packages)`,
      "Full copyright on the winning work",
      "Print + digital exports, plus source files",
      "English support and USD checkout for US businesses",
    ],
    [
      `Fixed ${productName.toLowerCase()} packages — know the budget before you launch`,
      "Multiple concepts when you choose a contest",
      "Revision rounds built into the package",
      "Remote delivery that still feels local when you search “near me”",
    ],
    [
      "Vetted designer community — not anonymous template dumps",
      `Bronze through Platinum tiers for ${productName.toLowerCase()}`,
      "Money-back guarantee details on the package page",
      "Works for startups, local shops, and national brands",
    ],
  ];

  let how = `Start with a short brief: audience, must-haves, and references. Launch a contest for variety or hire 1-to-1 if you already know the direction. Review concepts, request changes, then download final files.`;
  if (near) {
    how = `“Near me” searches often just mean you want US-friendly vendors. You don’t need an office down the street — publish the brief, get concepts from designers across the USA, and keep USD pricing + English support.`;
  } else if (hire) {
    how = `Ready to hire? Use a contest when you want side-by-side concepts, or open a 1-to-1 project when you prefer a single designer with milestones and chat.`;
  } else if (cheap) {
    how = `Budget-friendly doesn’t have to mean disposable. Pick Bronze for lean launches, or step up a tier when you need more designer participation — still fixed pricing, not open-ended retainers.`;
  } else if (agency) {
    how = `Agency-style outcomes without the retainer theater: fixed packages, competitive concepts, and Studio when you need a fuller brand system later.`;
  }

  const faqs = [
    {
      question: `What’s the practical way to get ${kw} in the USA?`,
      answer: `Launch a Creative Logo Makers contest for multiple custom concepts, or hire one designer 1-to-1. Both paths include structured revisions and commercial ownership of final files.`,
    },
    {
      question: `How much does ${kw} cost here?`,
      answer: `${productName} packages start from ${price}. Higher tiers raise prize money and attract more designers — you’ll see list price and sale price on the package cards.`,
    },
    {
      question: near
        ? `Do I need a local shop for “${kw}?`
        : `Is this only for big companies searching “${kw}?`,
      answer: near
        ? `Not necessarily. Remote contests reach vetted designers across the USA while keeping USD pricing and English support — which is what most “near me” shoppers actually need.`
        : `No. Startups and small US businesses use the same contest flow as larger teams — the package size is what scales, not the process.`,
    },
    {
      question: `How fast can I start?`,
      answer: `You can launch today. Most contests begin receiving concepts within a few days once the brief is live.`,
    },
  ];

  // light shuffle of FAQ order for uniqueness without nonsense
  if (n % 2 === 1) {
    const [a, b, ...rest] = faqs;
    faqs.splice(0, faqs.length, b, a, ...rest);
  }

  return {
    intro: intros[n % intros.length],
    bullets: bulletSets[n % bulletSets.length],
    howItWorks: how,
    faqs,
  };
}
