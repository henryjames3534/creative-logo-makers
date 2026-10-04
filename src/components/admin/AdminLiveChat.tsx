"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AdminCard,
  Badge,
  DeleteBtn,
  SectionTitle,
} from "@/components/admin/AdminUi";
import {
  closeChatSession,
  deleteChatSessions,
  listChatSessions,
  markChatSeen,
  onLiveChatUpdated,
  LIVE_CHAT_ADMIN_NAME,
  postChatMessage,
  releaseChatToBot,
  takeOverChatSession,
  type LiveChatSession,
} from "@/lib/live-chat";

export function AdminLiveChat() {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function refresh() {
    const list = listChatSessions();
    setSessions(list);
    setChecked((prev) => {
      const next = new Set([...prev].filter((id) => list.some((s) => s.id === id)));
      return next;
    });
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
  const allChecked =
    sessions.length > 0 && sessions.every((s) => checked.has(s.id));
  const checkedCount = useMemo(
    () => sessions.filter((s) => checked.has(s.id)).length,
    [sessions, checked],
  );

  useEffect(() => {
    if (active && !active.seenByAdmin) {
      markChatSeen(active.id);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCheckAll() {
    if (allChecked) {
      setChecked(new Set());
      return;
    }
    setChecked(new Set(sessions.map((s) => s.id)));
  }

  function onBulkDelete() {
    const ids = sessions.filter((s) => checked.has(s.id)).map((s) => s.id);
    if (!ids.length) return;
    if (
      !window.confirm(
        `Delete ${ids.length} selected chat${ids.length > 1 ? "s" : ""} permanently?`,
      )
    ) {
      return;
    }
    deleteChatSessions(ids);
    setChecked(new Set());
    refresh();
  }

  function onReply(e: FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    postChatMessage({
      sessionId: active.id,
      role: "admin",
      body: reply,
      agentName: LIVE_CHAT_ADMIN_NAME,
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

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <AdminCard className="max-h-[70vh] overflow-y-auto p-3">
          <SectionTitle title="Sessions" />
          {sessions.length > 0 ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] px-2.5 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[color:var(--a-muted)]">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleCheckAll}
                  className="h-4 w-4 rounded border-[color:var(--a-border)] accent-[#00a581]"
                />
                Select all ({sessions.length})
              </label>
              <DeleteBtn
                label={
                  checkedCount
                    ? `Delete (${checkedCount})`
                    : "Delete selected"
                }
                className={checkedCount ? "" : "pointer-events-none opacity-40"}
                onClick={() => {
                  if (!checkedCount) return;
                  onBulkDelete();
                }}
              />
            </div>
          ) : null}
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color:var(--a-faint)]">
              No chats yet. When a visitor lands, chat opens and alerts you.
            </p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((s) => {
                const last = s.messages[s.messages.length - 1];
                const selected = s.id === activeId;
                const isChecked = checked.has(s.id);
                return (
                  <li key={s.id}>
                    <div
                      className={`flex items-start gap-2 rounded-xl px-2 py-2 transition ${
                        selected
                          ? "bg-[#5b8def]/20 ring-1 ring-[#5b8def]/40"
                          : "hover:bg-[var(--a-hover)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 h-4 w-4 shrink-0 rounded border-[color:var(--a-border)] accent-[#00a581]"
                        aria-label={`Select chat ${s.ip || s.visitorKey}`}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveId(s.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-[var(--a-text)]">
                            {s.ip
                              ? s.ip
                              : `${s.visitorKey.replace(/^ip_/, "").slice(0, 18)}${
                                  s.visitorKey.length > 18 ? "…" : ""
                                }`}
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
                    </div>
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
                    {active.ip || active.visitorKey}
                  </p>
                  <p className="text-[11px] text-[color:var(--a-faint)]">
                    {active.path || "/"} · opened{" "}
                    {new Date(active.createdAt).toLocaleString()}
                    {active.adminTakeover
                      ? " · YOU own this chat (AI off)"
                      : " · AI active"}
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
                  <DeleteBtn
                    label="Delete"
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Delete this chat permanently?",
                        )
                      ) {
                        return;
                      }
                      deleteChatSessions([active.id]);
                      setChecked((prev) => {
                        const next = new Set(prev);
                        next.delete(active.id);
                        return next;
                      });
                      refresh();
                    }}
                  />
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
