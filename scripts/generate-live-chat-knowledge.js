/** Generate live-chat knowledge base with 1000+ question patterns */
const fs = require("fs");
const path = require("path");

const services = [
  ["logo", "logo design", "brand logo", "logotype", "wordmark", "emblem", "icon logo", "brand mark"],
  ["website", "web design", "landing page", "homepage", "wordpress site", "shopify store", "web redesign"],
  ["packaging", "label design", "product packaging", "box design", "pouch design", "bottle label"],
  ["business card", "visiting card", "stationery", "letterhead", "envelope design"],
  ["t-shirt", "tee design", "apparel", "merchandise", "hoodie design", "merch graphics"],
  ["book cover", "ebook cover", "magazine cover", "cover design"],
  ["social media", "instagram post", "facebook cover", "social ads", "banner ads", "story design"],
  ["illustration", "custom illustration", "character design", "digital art"],
  ["branding", "brand identity", "brand kit", "style guide", "brand guidelines", "visual identity"],
  ["flyer", "poster", "brochure", "one-pager", "print design"],
];

const intents = [
  ["price", "how much", "cost", "pricing", "budget", "rate", "charges", "fee", "kitna", "price list"],
  ["start", "how to start", "get started", "begin", "launch", "order", "buy", "purchase"],
  ["time", "how long", "turnaround", "delivery time", "deadline", "days", "timeline", "eta"],
  ["revision", "revisions", "changes", "edits", "round of changes", "modify"],
  ["contest", "competition", "multiple designers", "design contest"],
  ["hire", "1-to-1", "one on one", "dedicated designer", "private project"],
  ["files", "source files", "ai file", "psd", "svg", "vector", "formats"],
  ["refund", "money back", "guarantee", "cancel", "cancellation"],
  ["discount", "offer", "promo", "sale", "coupon", "70%", "50% off"],
  ["quality", "portfolio", "examples", "samples", "best designers"],
];

function repliesFor(svc, intent) {
  switch (intent) {
    case "price":
      return [
        `For ${svc}, contest packages usually start around $249 (sale pricing is live), and 1-to-1 projects from about $499. Want contest variety or a dedicated designer?`,
        `${svc} pricing depends on Bronze–Platinum contest tiers or a 1-to-1 project. Share your budget range and I will recommend a package.`,
        `Happy to help on ${svc} cost — most clients start with a contest from $249 or hire 1-to-1 from $499. Which feels better for you?`,
      ];
    case "start":
      return [
        `Easy — pick ${svc} on the site, choose Contest or Hire a designer, fill a short brief, and creatives start working. Want me to walk you through it?`,
        `To start ${svc}: go to Services → choose the category → Start a contest or browse designers. I can also guide you step by step here.`,
      ];
    case "time":
      return [
        `${svc} contests often move in a few days with first concepts coming in quickly; 1-to-1 timelines depend on scope. Do you have a hard deadline?`,
        `Turnaround for ${svc} is usually days for contests, and milestone-based for private projects. Tell me your date and we will plan around it.`,
      ];
    case "revision":
      return [
        `Yes — revisions are included based on your package (higher tiers get more rounds). For ${svc}, tell me which package you are considering and I will confirm revision limits.`,
        `You can request changes after you shortlist concepts. ${svc} packages include structured revision rounds so you can polish the winner.`,
      ];
    case "contest":
      return [
        `A ${svc} contest brings multiple designers submitting concepts so you compare styles and pick a winner. Great when you want options fast.`,
        `Contest mode for ${svc} = many concepts, you choose the favorite, and own the final files. Want help writing the brief?`,
      ];
    case "hire":
      return [
        `You can hire one specialist for ${svc} and work privately with milestones and chat. Browse designers or tell me your industry and I will suggest profiles.`,
        `1-to-1 is ideal if you already like a designer's style for ${svc}. Share your niche and I will help you shortlist.`,
      ];
    case "files":
      return [
        `Final ${svc} delivery includes web-ready and print-ready files (and vectors where relevant — SVG/AI/EPS depending on the work). Source files come with project completion.`,
        `You get usable production files for ${svc} once you select a winner / complete milestones. Need a specific format like SVG or PNG?`,
      ];
    case "refund":
      return [
        `Contest packages include a clear guarantee when no suitable concepts arrive — details are on the package page. Studio/custom scopes follow the agreement. What package are you looking at?`,
        `We want you happy with ${svc}. Guarantees differ for contests vs Studio. Tell me contest or 1-to-1 and I will explain the policy simply.`,
      ];
    case "discount":
      return [
        `Yes — package sale pricing is live (about 50% off list on many tiers). For ${svc}, locking in sooner helps while the promo runs. Want current starting prices?`,
        `Discounts are already reflected on package pages for ${svc}. I can help you pick Bronze/Silver/Gold/Platinum based on budget.`,
      ];
    default:
      return [
        `We have strong ${svc} portfolios across industries. Tell me your niche (food, tech, fashion, etc.) and I will point you to the right path.`,
        `Quality for ${svc} comes from vetted designers and clear briefs. Share a competitor or style you like and we will match you well.`,
      ];
  }
}

const topics = [];

topics.push({
  id: "greeting",
  questions: [
    "hi", "hello", "hey", "salam", "assalam o alaikum", "good morning",
    "good afternoon", "good evening", "yo", "hola", "namaste", "hi there",
    "hey there", "hello team", "anyone there", "is anyone online", "you there",
  ],
  replies: [
    "Hey! Glad you are here — what are you looking to design today: logo, website, packaging, or something else?",
    "Hi there! I can help with pricing, contests, or matching a designer. What do you need?",
    "Hello! Tell me your project in a line and I will point you the right way.",
  ],
});

for (const [svc, ...aliases] of services) {
  const allSvc = [svc, ...aliases];
  for (const [intent, ...iAliases] of intents) {
    const qs = [];
    for (const s of allSvc.slice(0, 5)) {
      for (const i of [intent, ...iAliases].slice(0, 6)) {
        qs.push(`${i} ${s}`);
        qs.push(`${s} ${i}`);
        qs.push(`what is the ${i} for ${s}`);
        qs.push(`do you do ${s}`);
        qs.push(`need ${s}`);
        qs.push(`looking for ${s}`);
      }
    }
    const uniq = [...new Set(qs.map((q) => q.toLowerCase()))];
    const id = `${svc}_${intent}`.replace(/\s+/g, "_");
    topics.push({
      id,
      questions: uniq.slice(0, 45),
      replies: repliesFor(svc, intent),
    });
  }
}

const faqs = [
  {
    id: "payment",
    questions: ["payment methods", "pay with card", "paypal", "credit card", "how to pay", "invoice", "billing", "secure payment", "debit card"],
    replies: ["We accept major cards and standard online checkout on the site. Payment is secured before designers begin. Need a receipt or company invoice?"],
  },
  {
    id: "ownership",
    questions: ["who owns", "copyright", "ownership", "intellectual property", "ip rights", "commercial use", "do i own the logo", "full rights"],
    replies: ["When the project completes and transfer is done, you own the final winning design for commercial use. That is a core part of how Creative Logo Makers works."],
  },
  {
    id: "regions",
    questions: ["urdu", "hindi", "pakistan", "india", "rupees", "pkr", "inr", "pakistani", "uae", "dubai", "uk", "canada", "australia"],
    replies: ["Yes — we work with clients worldwide. Pricing can show in your local currency where possible. What do you need designed?"],
  },
  {
    id: "contact",
    questions: ["phone number", "email address", "call me", "whatsapp", "contact info", "office address", "delaware", "support email"],
    replies: ["You can keep chatting here, use the Contact page, or leave your email/phone and a teammate will follow up. What is the best way to reach you?"],
  },
  {
    id: "account",
    questions: ["create account", "sign up", "login", "sign in", "google login", "forgot password", "my account", "dashboard"],
    replies: ["You can sign up or log in from the Login page — Google One Tap works in Chrome too. After login, your projects and messages live in Account."],
  },
  {
    id: "studio",
    questions: ["studio", "brand strategist", "full service agency", "enterprise branding", "naming package", "messaging workshop"],
    replies: ["Studio is our full-service track for deeper branding — messaging, naming, and brand systems from roughly $1,999–$4,499+. Is this for a launch or a rebrand?"],
  },
  {
    id: "thanks",
    questions: ["thank you", "thanks", "thx", "appreciate it", "great help", "shukriya", "jazakallah"],
    replies: [
      "You are welcome! If you want, I can help you pick a package next.",
      "Glad that helped — ready to start a brief whenever you are.",
    ],
  },
  {
    id: "human",
    questions: ["real person", "human", "agent", "talk to person", "not a bot", "representative", "manager", "speak to someone"],
    replies: ["I am here on the support team — if you need a specialist, tell me your topic and I will stay with you or bring someone in. What do you need help with most?"],
  },
  {
    id: "bronze_silver_gold",
    questions: ["bronze", "silver", "gold", "platinum", "which package", "package difference", "tiers", "upgrade package"],
    replies: [
      "Bronze → Platinum mainly differs by concepts, designers, and revision rounds. Gold/Platinum suit bigger launches. What is your budget range?",
      "If you want more options and revisions, go Gold or Platinum. Tighter budget? Bronze or Silver still works well for logos. What are you designing?",
    ],
  },
  {
    id: "brief",
    questions: ["brief", "how to write brief", "what to include", "inspiration", "moodboard", "references"],
    replies: [
      "A strong brief covers audience, style likes/dislikes, competitors, and must-have text. You can start with a rough note — we will refine it together.",
      "Share 2–3 brands you like, colors to avoid, and your tagline if any. That is enough to open a solid brief.",
    ],
  },
];

for (const f of faqs) topics.push(f);

const qCount = topics.reduce((n, t) => n + t.questions.length, 0);
const outPath = path.join(__dirname, "..", "src", "lib", "live-chat-knowledge.ts");
const body =
  `/** Auto-generated live chat knowledge — ${qCount} question patterns across ${topics.length} topics */\n\n` +
  `export type ChatKnowledgeTopic = {\n  id: string;\n  questions: string[];\n  replies: string[];\n};\n\n` +
  `export const LIVE_CHAT_KNOWLEDGE: ChatKnowledgeTopic[] = ${JSON.stringify(topics, null, 2)} as const;\n\n` +
  `export const LIVE_CHAT_KNOWLEDGE_QUESTION_COUNT = ${qCount};\n`;

fs.writeFileSync(outPath, body);
console.log(`topics=${topics.length} questions=${qCount} -> ${outPath}`);
