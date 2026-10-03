import {
  LIVE_CHAT_KNOWLEDGE,
  type ChatKnowledgeTopic,
} from "@/lib/live-chat-knowledge";
import { matchSiteChatAnswer } from "@/lib/live-chat-site-brain";
import {
  resolveConversationalReply,
  type ChatHistoryItem,
} from "@/lib/live-chat-conversation";

/** Proactive visitor live chat — localStorage + admin alerts + smart replies */

const CHAT_KEY = "clm_live_chat_v1";
const CHAT_UPDATED_KEY = "clm_live_chat_updated_at";
export const LIVE_CHAT_EVENT = "clm_live_chat";
export const LIVE_CHAT_OPEN_EVENT = "clm_live_chat_open";
export const LIVE_CHAT_HYDRATED_EVENT = "clm_live_chat_hydrated";

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
  /** Sticky support agent name for this chat (human feel) */
  agentName?: string;
  /**
   * When true, AI/bot must not reply — a human admin owns the thread.
   * Set automatically on first admin message or explicit Take over.
   */
  adminTakeover?: boolean;
  /** ISO time when admin took over */
  adminTakeoverAt?: string;
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
  const updatedAt = new Date().toISOString();
  localStorage.setItem(CHAT_KEY, JSON.stringify(store));
  localStorage.setItem(CHAT_UPDATED_KEY, updatedAt);
  window.dispatchEvent(new CustomEvent(LIVE_CHAT_EVENT));
  void import("@/lib/db-sync").then(({ scheduleStorePush }) => {
    scheduleStorePush("chat", store);
  });
}

export async function hydrateChatFromServer(): Promise<ChatStore> {
  if (typeof window === "undefined") return { sessions: [] };
  const { hydrateStoreKey } = await import("@/lib/db-sync");
  await hydrateStoreKey({
    key: "chat",
    localRaw: localStorage.getItem(CHAT_KEY),
    localUpdatedAt: localStorage.getItem(CHAT_UPDATED_KEY),
    writeLocal: (raw, updatedAt) => {
      localStorage.setItem(CHAT_KEY, raw);
      localStorage.setItem(CHAT_UPDATED_KEY, updatedAt);
    },
  });
  const store = loadStore();
  window.dispatchEvent(
    new CustomEvent(LIVE_CHAT_HYDRATED_EVENT, { detail: store }),
  );
  window.dispatchEvent(new CustomEvent(LIVE_CHAT_EVENT));
  return store;
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
  "Hey — thanks for stopping by Creative Logo Makers. Quick heads-up: our package sale is live (70% off — logo contests from about $75, was $249). I can help with logos, websites, packaging, pricing, contests, or hiring a designer. What are you working on?";

/** Display name for human admin messages in the visitor widget */
export const LIVE_CHAT_ADMIN_NAME = "Angelina";

/** Support agents shown on replies (human feel) */
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

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/** Keep price replies honest about the live 70% package sale. */
export function ensureSalePricingCopy(body: string): string {
  let text = body;
  const mentionsSale =
    /70\s*%|percent off|package sale|sale is live|offer is live|was \$249|from about \$75/i.test(
      text,
    );
  const quotesOldList =
    /\$249|\$499|start around \$|start from \$249|from \$249/i.test(text);

  if (quotesOldList && !mentionsSale) {
    text = text
      .replace(
        /contest packages usually start around \$249\s*\([^)]*\)/gi,
        "contest packages start from about $75 (was $249) with our live 70% off sale",
      )
      .replace(
        /start with a contest from \$249/gi,
        "start with a contest from about $75 (was $249, 70% off)",
      )
      .replace(
        /from about \$499/gi,
        "from the 1-to-1 packages listed on the site",
      );
    if (!/70\s*%|was \$249|from about \$75/i.test(text)) {
      text = `${text} Also — package sale is live: 70% off (logo contests from about $75, was $249).`;
    }
  }
  return text;
}

function normalizeChatText(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%$+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Score how well a topic matches the visitor message. */
function scoreTopic(text: string, topic: ChatKnowledgeTopic): number {
  let best = 0;
  for (const q of topic.questions) {
    const needle = q.toLowerCase().trim();
    if (!needle) continue;
    if (text === needle) {
      best = Math.max(best, 100 + needle.length);
      continue;
    }
    if (text.includes(needle)) {
      best = Math.max(best, 40 + needle.length);
      continue;
    }
    const tokens = needle.split(" ").filter((t) => t.length > 2);
    if (tokens.length === 0) continue;
    const hits = tokens.filter((t) => text.includes(t)).length;
    if (hits === 0) continue;
    const ratio = hits / tokens.length;
    if (ratio >= 0.6) {
      best = Math.max(best, Math.round(20 + ratio * 25 + needle.length * 0.3));
    }
  }
  return best;
}

/**
 * Human-like reply delay (ms): reads the message, then "types".
 * Longer visitor messages → slightly longer wait.
 */
export function humanReplyDelayMs(visitorMessage: string): number {
  const len = visitorMessage.trim().length;
  const readMs = Math.min(1800, 400 + len * 28);
  const typeMs = 1600 + Math.random() * 3200;
  const jitter = Math.random() * 900;
  return Math.round(readMs + typeMs + jitter);
}

/**
 * Relevant English bot reply for a visitor message (local fallback).
 * Multi-turn conversation engine → site brain → knowledge → soft sale clarify.
 */
export function generateBotReply(
  visitorMessage: string,
  preferredAgent?: string,
  history: ChatHistoryItem[] = [],
): {
  body: string;
  agentName?: string;
} {
  const agentName = preferredAgent || pickRandomAgent();
  const text = normalizeChatText(visitorMessage);
  if (!text) {
    return {
      agentName,
      body: "No rush — just tell me what you need: logo, website, packaging, or pricing.",
    };
  }

  const convo = resolveConversationalReply(visitorMessage, history);
  if (convo) {
    return { agentName, body: ensureSalePricingCopy(convo.body) };
  }

  const siteHit = matchSiteChatAnswer(visitorMessage);
  if (siteHit) {
    return { agentName, body: ensureSalePricingCopy(siteHit.answer) };
  }

  let bestTopic: ChatKnowledgeTopic | null = null;
  let bestScore = 0;
  for (const topic of LIVE_CHAT_KNOWLEDGE) {
    const score = scoreTopic(text, topic);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 32) {
    const raw = pickOne(bestTopic.replies)
      .replace(/â€”/g, "—")
      .replace(/â€™/g, "'");
    return { agentName, body: ensureSalePricingCopy(raw) };
  }

  // Never loop a useless clarify — give sale pricing as a useful default
  return {
    agentName,
    body: ensureSalePricingCopy(
      "Our package sale is live: 70% off. Basic/Bronze contest packages start from about $75 (was $249). Tell me logo, website, packaging, or branding and I will point you to the exact page.",
    ),
  };
}

export function isBotAllowed(session: LiveChatSession | null | undefined) {
  if (!session) return false;
  if (session.status !== "open") return false;
  if (session.adminTakeover) return false;
  return true;
}

/** Admin takes the thread — AI/bot stops immediately. */
export function takeOverChatSession(sessionId: string): LiveChatSession | null {
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  const now = new Date().toISOString();
  session.adminTakeover = true;
  session.adminTakeoverAt = now;
  session.seenByAdmin = true;
  session.updatedAt = now;
  saveStore(store);
  return session;
}

/** Optional: return chat to AI after admin is done. */
export function releaseChatToBot(sessionId: string): LiveChatSession | null {
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  session.adminTakeover = false;
  session.adminTakeoverAt = undefined;
  session.updatedAt = new Date().toISOString();
  saveStore(store);
  return session;
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
    if (!existing.agentName) existing.agentName = pickRandomAgent();
    saveStore(store);
    emitOpen(existing);
    return existing;
  }

  const now = new Date().toISOString();
  const agentName = pickRandomAgent();
  const session: LiveChatSession = {
    id: uid("chat"),
    visitorKey,
    path: input?.path,
    status: "open",
    createdAt: now,
    updatedAt: now,
    agentName,
    messages: [
      {
        id: uid("msg"),
        role: "bot",
        body: LIVE_CHAT_WELCOME,
        createdAt: now,
        agentName,
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
    // First admin message = takeover (bot must stop)
    if (!session.adminTakeover) {
      session.adminTakeover = true;
      session.adminTakeoverAt = now;
    }
  }
  saveStore(store);
  return session;
}

/** Post a contextual bot reply for the visitor's last message. */
export function postBotReply(
  sessionId: string,
  visitorMessage: string,
): LiveChatSession | null {
  const store = loadStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || !isBotAllowed(session)) return null;
  if (!session.agentName) {
    session.agentName = pickRandomAgent();
    saveStore(store);
  }
  const history: ChatHistoryItem[] = session.messages.map((m) => ({
    role: m.role,
    body: m.body,
  }));
  const { body, agentName } = generateBotReply(
    visitorMessage,
    session.agentName,
    history,
  );
  // Re-check after generating — admin may have taken over during delay
  const fresh = loadStore().sessions.find((s) => s.id === sessionId);
  if (!fresh || !isBotAllowed(fresh)) return null;
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
