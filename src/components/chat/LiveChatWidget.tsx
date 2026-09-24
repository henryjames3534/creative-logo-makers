"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getOpenSessionForVisitor,
  getVisitorChatKey,
  LIVE_CHAT_QUESTIONS,
  onLiveChatUpdated,
  openLiveChat,
  postBotQuestion,
  postChatMessage,
  type LiveChatSession,
} from "@/lib/live-chat";

const QUESTION_INTERVAL_MS = 4000;
/** Wait until after first paint so chat doesn't compete with hydration. */
const AUTO_OPEN_DELAY_MS = 7000;

export function LiveChatWidget() {
  const pathname = usePathname();
  const hide =
    pathname?.startsWith("/admin") || pathname?.startsWith("/designer");

  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<LiveChatSession | null>(null);
  const [text, setText] = useState("");
  const [qIndex, setQIndex] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const qIndexRef = useRef(1);

  useEffect(() => {
    sessionIdRef.current = session?.id || null;
  }, [session?.id]);

  useEffect(() => {
    if (hide) return;
    const key = getVisitorChatKey();
    const existing = getOpenSessionForVisitor(key);
    if (existing) {
      setSession(existing);
      const bots = existing.messages.filter((m) => m.role === "bot").length;
      setQIndex(Math.max(1, bots));
      qIndexRef.current = Math.max(1, bots);
    }

    const t = window.setTimeout(() => {
      if (openedOnce.current) return;
      openedOnce.current = true;
      const s = openLiveChat({ path: pathname || "/" });
      setSession(s);
      setOpen(true);
      setQIndex(1);
      qIndexRef.current = 1;
    }, AUTO_OPEN_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [hide, pathname]);

  useEffect(() => {
    if (hide) return;
    return onLiveChatUpdated(() => {
      const key = getVisitorChatKey();
      const s = getOpenSessionForVisitor(key);
      if (s) setSession({ ...s, messages: [...s.messages] });
    });
  }, [hide]);

  // Every 4s ask a new bot question while chat is open
  useEffect(() => {
    if (hide || !open) return;
    const id = window.setInterval(() => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      const idx = qIndexRef.current;
      const updated = postBotQuestion(sid, idx);
      qIndexRef.current = idx + 1;
      setQIndex(idx + 1);
      if (updated) setSession({ ...updated, messages: [...updated.messages] });
    }, QUESTION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hide, open]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session?.messages.length, open]);

  if (hide) return null;

  function ensureOpen() {
    const s = openLiveChat({ path: pathname || "/" });
    setSession(s);
    setOpen(true);
    if (!openedOnce.current) {
      openedOnce.current = true;
      setQIndex(1);
    }
  }

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!session || !text.trim()) return;
    const updated = postChatMessage({
      sessionId: session.id,
      role: "visitor",
      body: text,
    });
    setText("");
    if (updated) setSession({ ...updated, messages: [...updated.messages] });
  }

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[90] flex flex-col items-end gap-3">
      {open && session ? (
        <div className="pointer-events-auto flex h-[min(520px,min(70vh,calc(100dvh-6rem)))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3 !text-white">
            <div>
              <p className="text-sm font-semibold">Live design help</p>
              <p className="text-[11px] text-white/65">
                70% off · usually replies in seconds
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-lg leading-none text-white/70 hover:bg-white/10"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-2.5 overflow-y-auto bg-paper-soft px-3 py-3"
          >
            {session.messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "visitor" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    m.role === "visitor"
                      ? "rounded-br-md bg-ink !text-white"
                      : m.role === "admin"
                        ? "rounded-bl-md border border-green/30 bg-green/10 text-ink"
                        : "rounded-bl-md bg-white text-ink shadow-sm ring-1 ring-line"
                  }`}
                >
                  {m.role === "bot" ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-coral">
                      Creative Logo Makers
                    </p>
                  ) : null}
                  {m.role === "admin" ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-green">
                      Support
                    </p>
                  ) : null}
                  <p>{m.body}</p>
                </div>
              </div>
            ))}
            <p className="px-1 text-center text-[10px] text-muted">
              Tip: next tip in ~4s · {LIVE_CHAT_QUESTIONS.length} prompts
              rotating
            </p>
          </div>

          <form
            onSubmit={onSend}
            className="flex gap-2 border-t border-line bg-white p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer…"
              className="flex-1 rounded-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-ink"
            />
            <button
              type="submit"
              className="rounded-full bg-cta px-4 py-2.5 text-sm font-semibold !text-white hover:bg-cta-hover"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (open) setOpen(false);
          else ensureOpen();
        }}
        className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold !text-white shadow-lg hover:bg-black"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
        </span>
        {open ? "Hide chat" : "Chat with us"}
      </button>
    </div>
  );
}
