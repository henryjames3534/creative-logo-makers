"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  closeChatSession,
  listChatSessions,
  markChatSeen,
  onLiveChatUpdated,
  postChatMessage,
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
        <h1 className="text-2xl font-semibold text-white">Live chat</h1>
        <p className="mt-1 text-sm text-white/50">
          Visitor chats open automatically on the site. Reply here in real time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AdminCard className="max-h-[70vh] overflow-y-auto p-3">
          <SectionTitle title="Sessions" />
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
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
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">
                          {s.visitorKey.slice(0, 14)}…
                        </p>
                        {!s.seenByAdmin && s.status === "open" ? (
                          <Badge tone="coral">New</Badge>
                        ) : (
                          <Badge tone="neutral">{s.status}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-white/40">
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
            <p className="p-8 text-center text-sm text-white/40">
              Select a chat session.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {active.visitorKey}
                  </p>
                  <p className="text-[11px] text-white/40">
                    {active.path || "/"} · opened{" "}
                    {new Date(active.createdAt).toLocaleString()}
                  </p>
                </div>
                {active.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeChatSession(active.id);
                      refresh();
                    }}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                  >
                    Close chat
                  </button>
                ) : null}
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl px-3 py-2 text-sm ${
                      m.role === "visitor"
                        ? "ml-8 bg-[#5b8def]/15 text-white"
                        : m.role === "admin"
                          ? "mr-8 bg-[#00a581]/20 text-white"
                          : "mr-8 bg-white/5 text-white/80"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                      {m.role}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={onReply}
                className="flex gap-2 border-t border-white/10 p-3"
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply to visitor…"
                  className="flex-1 rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white outline-none focus:border-[#5b8def]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#5b8def] px-4 py-2 text-sm font-semibold text-white"
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
