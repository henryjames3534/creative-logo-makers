"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getChatSession,
  getOpenSessionForVisitor,
  getVisitorChatKey,
  humanReplyDelayMs,
  isBotAllowed,
  LIVE_CHAT_ADMIN_NAME,
  onLiveChatUpdated,
  openLiveChat,
  postChatMessage,
  type LiveChatSession,
} from "@/lib/live-chat";

/** Wait until after first paint so chat doesn't compete with hydration. */
const AUTO_OPEN_DELAY_MS = 9000;

export function LiveChatWidget() {
  const pathname = usePathname();
  const hide =
    pathname?.startsWith("/admin") || pathname?.startsWith("/designer");

  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<LiveChatSession | null>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);
  const replyTimer = useRef<number | null>(null);
  const replySeq = useRef(0);

  useEffect(() => {
    if (hide) return;
    const key = getVisitorChatKey();
    const existing = getOpenSessionForVisitor(key);
    if (existing) {
      setSession(existing);
    }

    const t = window.setTimeout(() => {
      if (openedOnce.current) return;
      openedOnce.current = true;
      const s = openLiveChat({ path: pathname || "/" });
      setSession(s);
      setOpen(true);
    }, AUTO_OPEN_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [hide, pathname]);

  useEffect(() => {
    if (hide) return;
    return onLiveChatUpdated(() => {
      const key = getVisitorChatKey();
      const s = getOpenSessionForVisitor(key);
      if (s) {
        setSession({ ...s, messages: [...s.messages] });
        // Admin took over — cancel pending AI/bot reply
        if (s.adminTakeover) {
          if (replyTimer.current) {
            window.clearTimeout(replyTimer.current);
            replyTimer.current = null;
          }
          replySeq.current += 1;
          setTyping(false);
          setTypingName(null);
        }
      }
    });
  }, [hide]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session?.messages.length, open, typing]);

  if (hide) return null;

  function ensureOpen() {
    const s = openLiveChat({ path: pathname || "/" });
    setSession(s);
    setOpen(true);
    openedOnce.current = true;
  }

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!session || !text.trim() || typing) return;
    const visitorText = text.trim();
    const updated = postChatMessage({
      sessionId: session.id,
      role: "visitor",
      body: visitorText,
    });
    setText("");
    if (updated) setSession({ ...updated, messages: [...updated.messages] });

    // Human admin owns this chat — do not call AI/bot
    const live = getChatSession(session.id);
    if (!isBotAllowed(live)) return;

    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    const agent = session.agentName || updated?.agentName || "Support";
    setTypingName(agent);
    setTyping(true);
    const sid = session.id;
    const delay = humanReplyDelayMs(visitorText);
    const seq = ++replySeq.current;

    replyTimer.current = window.setTimeout(() => {
      void (async () => {
        // Re-check takeover after typing delay
        const before = getChatSession(sid);
        if (!isBotAllowed(before) || seq !== replySeq.current) {
          setTyping(false);
          setTypingName(null);
          return;
        }

        let body = "";
        let agentName = before?.agentName || agent;
        try {
          const history = (before?.messages || [])
            .slice(-12)
            .map((m) => ({ role: m.role, body: m.body }));
          const res = await fetch("/api/chat/reply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: visitorText,
              agentName,
              path: before?.path || pathname || "/",
              history,
              adminTakeover: Boolean(before?.adminTakeover),
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            skipped?: boolean;
            body?: string;
            agentName?: string;
          };
          if (data.skipped || !data.ok || !data.body) {
            setTyping(false);
            setTypingName(null);
            return;
          }
          body = data.body;
          if (data.agentName) agentName = data.agentName;
        } catch {
          setTyping(false);
          setTypingName(null);
          return;
        }

        // Admin may have taken over while the AI request was in flight
        const after = getChatSession(sid);
        if (!isBotAllowed(after) || seq !== replySeq.current) {
          setTyping(false);
          setTypingName(null);
          return;
        }

        const withReply = postChatMessage({
          sessionId: sid,
          role: "bot",
          body,
          agentName,
        });
        setTyping(false);
        setTypingName(null);
        if (withReply) {
          setSession({ ...withReply, messages: [...withReply.messages] });
        }
      })();
    }, delay);
  }

  const headerAgent = session?.agentName || "Support";
  const humanMode = Boolean(session?.adminTakeover);

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[90] flex flex-col items-end gap-3">
      {open && session ? (
        <div className="pointer-events-auto flex h-[min(520px,min(70vh,calc(100dvh-6rem)))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3 !text-white">
            <div>
              <p className="text-sm font-semibold">
                Chat with {humanMode ? LIVE_CHAT_ADMIN_NAME : headerAgent}
              </p>
              <p className="text-[11px] text-white/65">
                {typing
                  ? `${typingName || headerAgent} is typing…`
                  : humanMode
                    ? "Connected with our team"
                    : "AI support · English · usually replies in seconds"}
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
                      {m.agentName || headerAgent}
                    </p>
                  ) : null}
                  {m.role === "admin" ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-green">
                      {m.agentName || LIVE_CHAT_ADMIN_NAME}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              </div>
            ))}
            {typing ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-muted shadow-sm ring-1 ring-line">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-coral">
                    {typingName || headerAgent}
                  </p>
                  <span className="inline-flex items-center gap-1" aria-label="Typing">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={onSend}
            className="flex gap-2 border-t border-line bg-white p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask in English about logos, pricing…"
              disabled={typing}
              className="flex-1 rounded-full border border-line px-3.5 py-2.5 text-sm outline-none focus:border-ink disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={typing || !text.trim()}
              className="rounded-full bg-cta px-4 py-2.5 text-sm font-semibold !text-white hover:bg-cta-hover disabled:opacity-50"
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
