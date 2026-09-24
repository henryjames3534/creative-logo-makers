"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import { adminReplyToCustomer } from "@/lib/auth-storage";
import {
  formatDuration,
  loadCrm,
  onInboxUpdated,
  relativeDay,
  updateInboxItem,
  type CrmInboxItem,
  type CrmState,
} from "@/lib/crm-storage";

export function AdminSupport() {
  const [state, setState] = useState<CrmState | null>(null);
  const [filter, setFilter] = useState<"open" | "all" | "revision" | "message">(
    "open",
  );
  const [active, setActive] = useState<CrmInboxItem | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    setState(loadCrm());
    return onInboxUpdated(() => setState(loadCrm()));
  }, []);

  const rows = useMemo(() => {
    if (!state?.inbox) return [];
    return state.inbox.filter((i) => {
      if (filter === "open") return i.status === "open" || i.status === "in_progress";
      if (filter === "revision") return i.kind === "revision";
      if (filter === "message") return i.kind === "message";
      return true;
    });
  }, [state, filter]);

  function onReply(e: FormEvent) {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    adminReplyToCustomer(active.customerEmail, active.serviceId, reply.trim());
    const next = updateInboxItem(active.id, {
      status: "resolved",
      adminReply: reply.trim(),
    });
    setState({ ...next });
    setActive({
      ...active,
      status: "resolved",
      adminReply: reply.trim(),
    });
    setReply("");
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Support inbox
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Customer portal revisions, messages, likes, and winner picks — manage
          replies here.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["open", "Open"],
            ["revision", "Revisions"],
            ["message", "Messages"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === id
                ? "bg-[#00a581] text-white"
                : "border border-white/10 text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <AdminCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-white/40">
                No items. When a customer sends a revision or message from
                /account, it lands here.
              </li>
            ) : (
              rows.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(item);
                      if (item.status === "open") {
                        const next = updateInboxItem(item.id, {
                          status: "in_progress",
                        });
                        setState({ ...next });
                        setActive({ ...item, status: "in_progress" });
                      }
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/[0.03] ${
                      active?.id === item.id ? "bg-white/[0.05]" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          item.kind === "revision"
                            ? "coral"
                            : item.kind === "message"
                              ? "blue"
                              : item.kind === "winner"
                                ? "gold"
                                : "green"
                        }
                      >
                        {item.kind}
                      </Badge>
                      <Badge
                        tone={
                          item.status === "resolved" ? "green" : "neutral"
                        }
                      >
                        {item.status}
                      </Badge>
                      <span className="text-[11px] text-white/35">
                        {relativeDay(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">
                      {item.customerName}{" "}
                      <span className="font-normal text-white/45">
                        · {item.customerEmail}
                      </span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/50">
                      {item.body}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </AdminCard>

        <AdminCard className="p-5">
          {!active ? (
            <p className="text-sm text-white/40">
              Select a revision or message to reply.
            </p>
          ) : (
            <div>
              <SectionTitle title={active.serviceTitle} />
              <p className="text-sm text-white/70">
                {active.customerName} · {active.customerEmail}
              </p>
              <p className="mt-4 rounded-xl border border-white/10 bg-[#0f1115] p-4 text-sm text-white/80 whitespace-pre-wrap">
                {active.body}
              </p>
              {active.adminReply ? (
                <div className="mt-3 rounded-xl border border-[#00a581]/30 bg-[#00a581]/10 p-4 text-sm text-[#5ee0bf]">
                  <p className="text-[11px] font-bold uppercase tracking-wide">
                    Your reply
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{active.adminReply}</p>
                </div>
              ) : null}
              <form onSubmit={onReply} className="mt-4 space-y-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  placeholder="Reply to customer portal…"
                  className="w-full rounded-xl border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Send reply &amp; resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = updateInboxItem(active.id, {
                        status: "resolved",
                      });
                      setState({ ...next });
                      setActive({ ...active, status: "resolved" });
                    }}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
                  >
                    Mark resolved
                  </button>
                </div>
              </form>
              <p className="mt-3 text-[11px] text-white/35">
                Reply also appears in the customer&apos;s /account messages
                thread.
              </p>
            </div>
          )}
        </AdminCard>
      </div>

      <p className="text-xs text-white/30">
        Open tasks auto-created for new inbox items ·{" "}
        {state.tasks.filter((t) => t.status !== "done").length} open tasks ·
        avg visitor session{" "}
        {formatDuration(
          state.visitors.reduce((s, v) => s + v.totalDurationMs, 0) /
            Math.max(1, state.visitors.length),
        )}
      </p>
    </div>
  );
}
