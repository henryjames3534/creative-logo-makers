"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  closeChatSession,
  listChatSessions,
  markChatSeen,
  onLiveChatUpdated,
  postChatMessage,
  releaseChatToBot,
  takeOverChatSession,
  type LiveChatSession,
} from "@/lib/live-chat";

export function AdminLiveChat() {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  function refresh() {
    const list = listChatSessions();
    setSessions(list);
    setActiveId((prev) => {
      if (prev && list.some((s) => s.id === prev)) return prev;
      return list[0]?.id || null;
    });
  }

  useEffect(() => {
    refresh();
    return onLiveChatUpdated(refresh);
  }, []);

  const active = sessions.find((s) => s.id === activeId) || null;

  useEffect(() => {
    if (active && !active.seenByAdmin) {
      markChatSeen(active.id);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function onReply(e: FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    postChatMessage({
      sessionId: active.id,
      role: "admin",
      body: reply,
    });
    setReply("");
    refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">Live chat</h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          AI answers in English from site knowledge until you take over — then
          the bot stays silent.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AdminCard className="max-h-[70vh] overflow-y-auto p-3">
          <SectionTitle title="Sessions" />
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color:var(--a-faint)]">
              No chats yet. When a visitor lands, chat opens and alerts you.
            </p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((s) => {
                const last = s.messages[s.messages.length - 1];
                const selected = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        selected
                          ? "bg-[#5b8def]/20 ring-1 ring-[#5b8def]/40"
                          : "hover:bg-[var(--a-hover)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--a-text)]">
                          {s.visitorKey.slice(0, 14)}…
                        </p>
                        {!s.seenByAdmin && s.status === "open" ? (
                          <Badge tone="coral">New</Badge>
                        ) : (
                          <Badge tone="neutral">{s.status}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[color:var(--a-faint)]">
                        {s.path || "/"} · {last?.body.slice(0, 48)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="flex max-h-[70vh] flex-col p-0">
          {!active ? (
            <p className="p-8 text-center text-sm text-[color:var(--a-faint)]">
              Select a chat session.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--a-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--a-text)]">
                    {active.visitorKey}
                  </p>
                  <p className="text-[11px] text-[color:var(--a-faint)]">
                    {active.path || "/"} · opened{" "}
                    {new Date(active.createdAt).toLocaleString()}
                    {active.adminTakeover ? " · YOU own this chat (AI off)" : " · AI active"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {active.status === "open" && !active.adminTakeover ? (
                    <button
                      type="button"
                      onClick={() => {
                        takeOverChatSession(active.id);
                        refresh();
                      }}
                      className="rounded-full bg-[#fe5f50] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Take over (stop AI)
                    </button>
                  ) : null}
                  {active.status === "open" && active.adminTakeover ? (
                    <button
                      type="button"
                      onClick={() => {
                        releaseChatToBot(active.id);
                        refresh();
                      }}
                      className="rounded-full border border-[color:var(--a-border-strong)] px-3 py-1.5 text-xs text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                    >
                      Return to AI
                    </button>
                  ) : null}
                  {active.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeChatSession(active.id);
                        refresh();
                      }}
                      className="rounded-full border border-[color:var(--a-border-strong)] px-3 py-1.5 text-xs text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                    >
                      Close chat
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl px-3 py-2 text-sm ${
                      m.role === "visitor"
                        ? "ml-8 bg-[#5b8def]/15 text-[var(--a-text)]"
                        : m.role === "admin"
                          ? "mr-8 bg-[#00a581]/20 text-white"
                          : "mr-8 bg-[var(--a-hover)] text-[color:var(--a-muted)]"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--a-faint)]">
                      {m.role}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={onReply}
                className="flex gap-2 border-t border-[color:var(--a-border)] p-3"
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply to visitor…"
                  className="flex-1 rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#5b8def]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#5b8def] px-4 py-2 text-sm font-semibold text-[var(--a-text)]"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
