import {
  LIVE_CHAT_KNOWLEDGE,
  type ChatKnowledgeTopic,
} from "@/lib/live-chat-knowledge";

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
  "Hey — thanks for stopping by Creative Logo Makers. I can help with logos, websites, packaging, pricing, contests, or hiring a designer. What are you working on?";

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
 * Relevant bot reply for a visitor message.
 * agentName is set on every reply for a human feel.
 */
export function generateBotReply(
  visitorMessage: string,
  preferredAgent?: string,
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

  let bestTopic: ChatKnowledgeTopic | null = null;
  let bestScore = 0;
  for (const topic of LIVE_CHAT_KNOWLEDGE) {
    const score = scoreTopic(text, topic);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 28) {
    return {
      agentName,
      body: pickOne(bestTopic.replies),
    };
  }

  if (bestTopic && bestScore >= 16) {
    return {
      agentName,
      body: `${pickOne(bestTopic.replies)} If I misunderstood, just rephrase and I will adjust.`,
    };
  }

  const fallbacks = [
    `Got it — I want to answer that properly. Are you asking about pricing, turnaround, contests, or hiring a designer?`,
    `Thanks for the note. Quick check so I can help: is this for a logo, website, packaging, or branding?`,
    `I can help with that. Share a bit more — budget, deadline, or the service you need — and I will give you a clear next step.`,
  ];
  return {
    agentName,
    body: pickOne(fallbacks),
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
  if (!session) return null;
  if (!session.agentName) {
    session.agentName = pickRandomAgent();
    saveStore(store);
  }
  const { body, agentName } = generateBotReply(
    visitorMessage,
    session.agentName,
  );
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
