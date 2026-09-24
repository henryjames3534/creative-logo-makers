"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  loadCrm,
  money,
  onInboxUpdated,
  postDesignerProjectMessage,
  relativeDay,
  updateProjectMessageStatus,
  updateProjectRevision,
  upsertTask,
  type ProjectRevisionStatus,
} from "@/lib/crm-storage";
import {
  getDesignerSession,
  getDesignerWorkload,
  type DesignerSession,
} from "@/lib/designer-session";

const REV_STATUSES: ProjectRevisionStatus[] = [
  "pending",
  "in_progress",
  "delivered",
  "closed",
  "rejected",
];

export function DesignerProjectDetail() {
  const params = useParams();
  const id = String(params?.id || "");
  const [session, setSession] = useState<DesignerSession | null>(null);
  const [tick, setTick] = useState(0);
  const [reply, setReply] = useState("");
  const [activeRev, setActiveRev] = useState<string | null>(null);
  const [composeKind, setComposeKind] = useState<"remark" | "request">(
    "remark",
  );
  const [composeBody, setComposeBody] = useState("");
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeOk, setComposeOk] = useState<string | null>(null);

  useEffect(() => {
    setSession(getDesignerSession());
    return onInboxUpdated(() => setTick((t) => t + 1));
  }, []);

  const view = useMemo(() => {
    if (!session) return null;
    const work = getDesignerWorkload(session.designerId, loadCrm());
    return work.projects.find((p) => p.project.id === id) || null;
  }, [session, id, tick]);

  if (!session) return <p className="text-white/50">Loading…</p>;

  if (!view) {
    return (
      <div className="space-y-4">
        <Link href="/designer/projects" className="text-sm text-[#5b8def]">
          ← My projects
        </Link>
        <p className="text-white/50">
          Project not found or not assigned to you.
        </p>
      </div>
    );
  }

  const { project, tasks, allRevisions } = view;
  const thread = [...(project.messages || [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  function refresh() {
    setTick((t) => t + 1);
  }

  function onDeliver(e: FormEvent) {
    e.preventDefault();
    if (!activeRev) return;
    updateProjectRevision(project.id, activeRev, {
      status: "delivered",
      adminReply: reply.trim() || "Delivered from designer portal",
    });
    setReply("");
    setActiveRev(null);
    refresh();
  }

  function onCompose(e: FormEvent) {
    e.preventDefault();
    setComposeError(null);
    setComposeOk(null);
    if (!session) return;
    if (composeBody.trim().length < 4) {
      setComposeError("Write at least a short note (4+ characters).");
      return;
    }
    const msg = postDesignerProjectMessage({
      projectId: project.id,
      designerId: session.designerId,
      designerName: session.name,
      body: composeBody,
      kind: composeKind,
    });
    if (!msg) {
      setComposeError("Could not send — check assignment and try again.");
      return;
    }
    setComposeBody("");
    setComposeOk(
      composeKind === "request"
        ? "Request sent to client. They’ll see it in My account → Messages."
        : "Remark posted. Client can see it in their portal.",
    );
    refresh();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/designer/projects"
        className="text-sm text-[#5b8def] hover:underline"
      >
        ← My projects
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b8def]">
          {project.orderId}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          {project.title || project.categoryName}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {project.customerName} ({project.customerEmail}) ·{" "}
          {project.packageName} · {money(project.amount)}
        </p>
        <p className="mt-2 text-xs capitalize text-white/40">
          Status: {project.status.replace(/_/g, " ")} · Revisions{" "}
          {project.revisionsUsed}/{project.revisionLimit}
        </p>
      </div>

      {/* Remarks + client requests */}
      <section className="rounded-2xl border border-white/10 bg-[#141a28] p-4 md:p-5">
        <h2 className="text-lg font-semibold text-white">
          Remarks & client requests
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Leave notes on the project, or ask the client for files, feedback, or
          missing brief details — they get it in My account.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setComposeKind("remark");
              setComposeOk(null);
              setComposeError(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              composeKind === "remark"
                ? "bg-[#5b8def] text-white"
                : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            Remark / note
          </button>
          <button
            type="button"
            onClick={() => {
              setComposeKind("request");
              setComposeOk(null);
              setComposeError(null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              composeKind === "request"
                ? "bg-amber-500/90 text-white"
                : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            Request from client
          </button>
        </div>

        <form onSubmit={onCompose} className="mt-4 space-y-3">
          <textarea
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            rows={3}
            placeholder={
              composeKind === "request"
                ? "e.g. Please upload your logo vector, brand colors, and 2–3 competitor references…"
                : "e.g. First concepts ready tomorrow — focusing on bold wordmark options…"
            }
            className="w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2.5 text-sm text-white placeholder:text-white/30"
          />
          {composeError ? (
            <p className="text-xs text-red-400">{composeError}</p>
          ) : null}
          {composeOk ? (
            <p className="text-xs text-emerald-400">{composeOk}</p>
          ) : null}
          <button
            type="submit"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white ${
              composeKind === "request"
                ? "bg-amber-500 hover:bg-amber-400"
                : "bg-[#5b8def] hover:bg-[#4a7de0]"
            }`}
          >
            {composeKind === "request"
              ? "Send request to client"
              : "Post remark"}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/40">
            Thread
          </p>
          {thread.length === 0 ? (
            <p className="text-sm text-white/40">
              No remarks or requests yet. Post the first note above.
            </p>
          ) : (
            thread.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border px-3.5 py-3 ${
                  m.kind === "request"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : m.from === "customer"
                      ? "border-emerald-500/25 bg-emerald-500/10"
                      : "border-white/10 bg-[#0c1220]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                    {m.author}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.kind === "request"
                        ? "bg-amber-500/25 text-amber-200"
                        : m.kind === "reply"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-white/10 text-white/55"
                    }`}
                  >
                    {m.kind === "request"
                      ? "Request"
                      : m.kind === "reply"
                        ? "Client reply"
                        : "Remark"}
                  </span>
                  {m.status ? (
                    <span className="text-[10px] uppercase text-white/40">
                      {m.status}
                    </span>
                  ) : null}
                  <span className="ml-auto text-[11px] text-white/35">
                    {relativeDay(m.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-white/80">
                  {m.body}
                </p>
                {m.kind === "request" && m.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateProjectMessageStatus(project.id, m.id, "fulfilled");
                      refresh();
                    }}
                    className="mt-2 text-xs font-semibold text-amber-200 hover:underline"
                  >
                    Mark as received / done
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Revisions (auto from customer / admin)
        </h2>
        {allRevisions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
            No revision rounds yet. When customer requests a revision, it appears
            here.
          </p>
        ) : (
          allRevisions.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#141a28] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#5b8def]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#9bbcf5]">
                  Round {r.round}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                  {r.status}
                </span>
                <span className="text-[11px] text-white/35">
                  {relativeDay(r.createdAt)} · {r.requestedBy}
                </span>
              </div>
              <p className="mt-2 font-medium text-white">{r.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white/60">
                {r.note}
              </p>
              {r.adminReply ? (
                <p className="mt-2 rounded-lg border border-[#5b8def]/25 bg-[#5b8def]/10 px-3 py-2 text-xs text-[#9bbcf5]">
                  Your delivery note: {r.adminReply}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={r.status}
                  onChange={(e) => {
                    updateProjectRevision(project.id, r.id, {
                      status: e.target.value as ProjectRevisionStatus,
                    });
                    refresh();
                  }}
                  className="rounded-lg border border-white/10 bg-[#0c1220] px-2 py-1.5 text-xs text-white"
                >
                  {REV_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRev(r.id);
                    setReply(r.adminReply || "");
                  }}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                >
                  Deliver / reply
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {activeRev ? (
        <form
          onSubmit={onDeliver}
          className="rounded-2xl border border-[#5b8def]/30 bg-[#141a28] p-4"
        >
          <p className="text-sm font-semibold text-white">Delivery note</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="What you delivered / changed…"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2 text-sm text-white"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#5b8def] px-4 py-2 text-sm font-semibold text-white"
            >
              Mark delivered
            </button>
            <button
              type="button"
              onClick={() => setActiveRev(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Project tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-white/40">No tasks on this project.</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#141a28] px-4 py-3"
            >
              <button
                type="button"
                onClick={() => {
                  upsertTask({
                    ...t,
                    status: t.status === "done" ? "todo" : "done",
                  });
                  refresh();
                }}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  t.status === "done"
                    ? "border-[#5b8def] bg-[#5b8def] text-white"
                    : "border-white/20"
                }`}
              >
                {t.status === "done" ? "✓" : ""}
              </button>
              <div>
                <p
                  className={`text-sm font-medium ${
                    t.status === "done"
                      ? "text-white/40 line-through"
                      : "text-white"
                  }`}
                >
                  {t.title}
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  Due {relativeDay(t.dueAt)} · {t.priority}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
