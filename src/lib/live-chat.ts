/** Proactive visitor live chat — localStorage + admin alerts */

const CHAT_KEY = "clm_live_chat_v1";
export const LIVE_CHAT_EVENT = "clm_live_chat";
export const LIVE_CHAT_OPEN_EVENT = "clm_live_chat_open";

export type ChatRole = "bot" | "visitor" | "admin";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  body: string;
  createdAt: string;
  /** Shown when bot hands off to a named agent */
  agentName?: string;
};

export type LiveChatSession = {
  id: string;
  visitorKey: string;
  path?: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  lastVisitorAt?: string;
  messages: ChatMessage[];
  /** Admin has seen this session */
  seenByAdmin?: boolean;
};

type ChatStore = {
  sessions: LiveChatSession[];
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function loadStore(): ChatStore {
  if (typeof window === "undefined") return { sessions: [] };
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return { sessions: [] };
    const parsed = JSON.parse(raw) as ChatStore;
    return { sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [] };
  } catch {
    return { sessions: [] };
  }
}

function saveStore(store: ChatStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(LIVE_CHAT_EVENT));
}

function emitOpen(session: LiveChatSession) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LIVE_CHAT_OPEN_EVENT, { detail: session }),
  );
}

export function getVisitorChatKey() {
  if (typeof window === "undefined") return "anon";
  try {
    const existing = sessionStorage.getItem("clm_chat_visitor");
    if (existing) return existing;
    const key = uid("vis");
    sessionStorage.setItem("clm_chat_visitor", key);
    return key;
  } catch {
    return uid("vis");
  }
}

export function listChatSessions(): LiveChatSession[] {
  return loadStore().sessions.sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

export function getChatSession(id: string): LiveChatSession | null {
  return loadStore().sessions.find((s) => s.id === id) || null;
}

export function getOpenSessionForVisitor(
  visitorKey: string,
): LiveChatSession | null {
  return (
    loadStore().sessions.find(
      (s) => s.visitorKey === visitorKey && s.status === "open",
    ) || null
  );
}

export function unreadChatCount(): number {
  return loadStore().sessions.filter(
    (s) => s.status === "open" && !s.seenByAdmin,
  ).length;
}

export const LIVE_CHAT_WELCOME =
  "Hey! 👋 Welcome to Creative Logo Makers — ask about logos, websites, packaging, pricing, or contests and we’ll help right away.";

/** Support agents shown on handoff when we can’t answer confidently */
export const LIVE_CHAT_AGENTS = [
  "Mike",
  "Judiyan",
  "Sarah",
  "Alex",
  "Emma",
  "Daniel",
  "Priya",
  "Jordan",
  "Maya",
  "Chris",
];

export function pickRandomAgent(): string {
  return LIVE_CHAT_AGENTS[Math.floor(Math.random() * LIVE_CHAT_AGENTS.length)]!;
}

type ReplyRule = {
  keys: string[];
  reply: string;
};

const REPLY_RULES: ReplyRule[] = [
  {
    keys: ["logo", "logotype", "brand mark", "wordmark", "emblem"],
    reply:
      "We can start a logo contest or match you with a 1-to-1 designer. Most logo packages begin around $175 — and up to 70% off is running now. Want contest or a dedicated designer?",
  },
  {
    keys: ["website", "web design", "landing", "wordpress", "shopify", "squarespace"],
    reply:
      "We design websites and landing pages alongside branding. Tell me if you need a new site, a redesign, or logo + website together and I’ll point you to the right package.",
  },
  {
    keys: ["packaging", "label", "box", "product pack"],
    reply:
      "Packaging & label design is one of our specialties — food, beverage, cosmetics, and retail. Share your product type and I’ll suggest a package.",
  },
  {
    keys: ["price", "pricing", "cost", "budget", "how much", "rate", "charges", "fee"],
    reply:
      "Pricing depends on the service: logos often start near $175, with Essential / Growth / Pro tiers and up to 70% off right now. What are you looking to design?",
  },
  {
    keys: ["contest", "competition", "multiple designers"],
    reply:
      "In a contest, multiple designers submit concepts and you pick a winner. It’s great for variety and fast ideas. Want me to help you start a brief?",
  },
  {
    keys: ["designer", "hire", "1-to-1", "1 to 1", "one on one", "dedicated"],
    reply:
      "You can hire a designer 1-to-1 for focused collaboration. Browse designers on the site, or tell me your industry and style and I’ll recommend a few.",
  },
  {
    keys: ["discount", "offer", "promo", "70%", "sale", "deal", "off"],
    reply:
      "Yes — up to 70% off is live on select packages. Locking in sooner helps while the promo lasts. Which service are you interested in?",
  },
  {
    keys: ["time", "how long", "turnaround", "delivery", "deadline", "days", "week"],
    reply:
      "Typical logo contests move in a few days; 1-to-1 projects depend on scope. Share your deadline and we’ll plan around it.",
  },
  {
    keys: ["contact", "phone", "email", "call", "whatsapp", "address"],
    reply:
      "You can reach us via this chat, the Contact page, or leave your email/phone here and an agent will follow up shortly.",
  },
  {
    keys: ["clothing", "tshirt", "t-shirt", "apparel", "merchandise", "merch"],
    reply:
      "We do clothing & merch design (tees, apparel branding, product graphics). Tell me the item and vibe you want — modern, street, luxury, etc.",
  },
  {
    keys: ["branding", "brand identity", "brand guide", "stationery", "business card"],
    reply:
      "Full branding can include logo, colors, fonts, stationery, and guidelines. Are you starting fresh or refreshing an existing brand?",
  },
  {
    keys: ["social", "instagram", "facebook", "banner", "ads", "flyer", "poster"],
    reply:
      "We design social creatives, ads, flyers, and posters. Share the platform and goal (launch, sale, awareness) and I’ll guide the next step.",
  },
  {
    keys: ["hello", "hi", "hey", "salam", "assalam", "good morning", "good evening"],
    reply:
      "Hi there! How can we help — logo, website, packaging, branding, or something else?",
  },
  {
    keys: ["thank", "thanks", "thx", "appreciate"],
    reply:
      "You’re welcome! Anything else you want to know before we get started?",
  },
];

/**
 * Relevant bot reply for a visitor message.
 * Returns `{ body, agentName? }` — agentName set when handing off.
 */
export function generateBotReply(visitorMessage: string): {
  body: string;
  agentName?: string;
} {
  const text = visitorMessage.toLowerCase().replace(/\s+/g, " ").trim();
  if (!text) {
    return {
      body: "Go ahead and tell us what you need — logo, website, packaging, or pricing.",
    };
  }

  for (const rule of REPLY_RULES) {
    if (rule.keys.some((k) => text.includes(k))) {
      return { body: rule.reply };
    }
  }

  const agentName = pickRandomAgent();
  return {
    agentName,
    body: `Connecting you with ${agentName} — they’ll join this chat shortly to help with your question.`,
  };
}

export function openLiveChat(input?: {
  path?: string;
  visitorKey?: string;
}): LiveChatSession {
  const store = loadStore();
  const visitorKey = input?.visitorKey || getVisitorChatKey();
  const existing = store.sessions.find(
    (s) => s.visitorKey === visitorKey && s.status === "open",
  );
  if (existing) {
    existing.path = input?.path || existing.path;
    existing.updatedAt = new Date().toISOString();
    existing.seenByAdmin = false;
    saveStore(store);
    emitOpen(existing);
    return existing;
  }

  const now = new Date().toISOString();
  const session: LiveChatSession = {
    id: uid("chat"),
    visitorKey,
    path: input?.path,
    status: "open",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: uid("msg"),
        role: "bot",
        body: LIVE_CHAT_WELCOME,
        createdAt: now,
      },
    ],
    seenByAdmin: false,
  };
  store.sessions.unshift(session);
  saveStore(store);
  emitOpen(session);
  return session;
}

export function postChatMessage(input: {
  sessionId: string;
  role: ChatRole;
  body: string;
  agentName?: string;
}): LiveChatSession | null {
  const trimmed = input.body.trim();
  if (!trimmed) return null;
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) return null;
  const now = new Date().toISOString();
  session.messages.push({
    id: uid("msg"),
    role: input.role,
    body: trimmed,
    createdAt: now,
    ...(input.agentName ? { agentName: input.agentName } : {}),
  });
  session.updatedAt = now;
  if (input.role === "visitor") {
    session.lastVisitorAt = now;
    session.seenByAdmin = false;
  }
  if (input.role === "admin") {
    session.seenByAdmin = true;
  }
  saveStore(store);
  return session;
}

/** Post a contextual bot reply (or agent handoff) for the visitor's last message. */
export function postBotReply(
  sessionId: string,
  visitorMessage: string,
): LiveChatSession | null {
  const { body, agentName } = generateBotReply(visitorMessage);
  return postChatMessage({ sessionId, role: "bot", body, agentName });
}

export function markChatSeen(sessionId: string) {
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.seenByAdmin = true;
  saveStore(store);
}

export function closeChatSession(sessionId: string) {
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.status = "closed";
  session.updatedAt = new Date().toISOString();
  saveStore(store);
}

export function onLiveChatUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(LIVE_CHAT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(LIVE_CHAT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function onLiveChatOpened(
  cb: (session: LiveChatSession) => void,
) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<LiveChatSession>).detail;
    if (detail) cb(detail);
  };
  window.addEventListener(LIVE_CHAT_OPEN_EVENT, handler);
  return () => window.removeEventListener(LIVE_CHAT_OPEN_EVENT, handler);
}
