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

/** Bot sales questions — every ~4s (English only) */
export const LIVE_CHAT_QUESTIONS = [
  "Hey! 👋 Welcome to Creative Logo Makers — what brings you here today?",
  "What do you need — a logo, website, packaging, or something else?",
  "Great news: we have up to 70% off running right now. Interested?",
  "Would you prefer a design contest or a 1-to-1 designer?",
  "Do you already have a brand name, or should we brainstorm first?",
  "Roughly what budget are you thinking — Essential, Growth, or Pro?",
  "When do you need the design — this week, or are you flexible?",
  "What industry are you in (cafe, tech, fashion, etc.)?",
  "Which logo style do you prefer — modern, luxury, playful, or minimal?",
  "Shall I match you with a designer, or start a contest brief?",
  "Anything specific we should know — colors, examples, competitors?",
  "70% off packages can sell out fast — want to lock one in?",
];

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
        body: LIVE_CHAT_QUESTIONS[0],
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

export function postBotQuestion(
  sessionId: string,
  questionIndex: number,
): LiveChatSession | null {
  const q =
    LIVE_CHAT_QUESTIONS[questionIndex % LIVE_CHAT_QUESTIONS.length] ||
    LIVE_CHAT_QUESTIONS[0];
  return postChatMessage({ sessionId, role: "bot", body: q });
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
