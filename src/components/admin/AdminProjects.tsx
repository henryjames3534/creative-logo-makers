"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  addProjectRevision,
  loadCrm,
  money,
  onInboxUpdated,
  relativeDay,
  updateProjectRevision,
  upsertTask,
  type CrmOrder,
  type CrmState,
  type CrmTask,
  type ProjectRevisionStatus,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/crm-storage";

const REV_STATUSES: ProjectRevisionStatus[] = [
  "pending",
  "in_progress",
  "delivered",
  "closed",
  "rejected",
];

export function AdminProjects() {
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"tasks" | "revisions">("revisions");

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    dueAt: "",
    notes: "",
  });

  const [revOpen, setRevOpen] = useState(false);
  const [revDraft, setRevDraft] = useState({ title: "", note: "" });

  useEffect(() => {
    setState(loadCrm());
    return onInboxUpdated(() => setState(loadCrm()));
  }, []);

  useEffect(() => {
    if (!selectedId && state?.orders[0]) setSelectedId(state.orders[0].id);
  }, [state, selectedId]);

  const projects = useMemo(() => {
    if (!state) return [];
    return state.orders.filter((o) => {
      const hay =
        `${o.orderId} ${o.title ?? ""} ${o.customerName} ${o.customerEmail} ${o.categoryName}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q]);

  const project: CrmOrder | null = useMemo(() => {
    if (!state || !selectedId) return null;
    return state.orders.find((o) => o.id === selectedId) || null;
  }, [state, selectedId]);

  const projectTasks: CrmTask[] = useMemo(() => {
    if (!state || !project) return [];
    return state.tasks
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [state, project]);

  function refresh() {
    setState(loadCrm());
  }

  function onAddTask(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    upsertTask({
      title: taskDraft.title,
      priority: taskDraft.priority,
      status: taskDraft.status,
      dueAt: new Date(taskDraft.dueAt || Date.now()).toISOString(),
      notes: taskDraft.notes || undefined,
      projectId: project.id,
      relatedType: "project",
      relatedId: project.id,
      ownerId: "own_admin",
    });
    setTaskOpen(false);
    setTaskDraft({
      title: "",
      priority: "medium",
      status: "todo",
      dueAt: "",
      notes: "",
    });
    refresh();
  }

  function onAddRevision(e: FormEvent) {
    e.preventDefault();
    if (!project || !revDraft.note.trim()) return;
    addProjectRevision({
      projectId: project.id,
      title: revDraft.title || undefined,
      note: revDraft.note.trim(),
      requestedBy: "admin",
    });
    setRevOpen(false);
    setRevDraft({ title: "", note: "" });
    refresh();
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <p className="mt-1 text-sm text-white/50">
          Har project ke apne tasks aur multiple revision rounds — yahan manage
          hote hain.
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects…"
        className="w-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.3fr]">
        <AdminCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {projects.map((o) => {
              const tasksN = state.tasks.filter((t) => t.projectId === o.id)
                .length;
              const openRevs = (o.revisions || []).filter(
                (r) => r.status === "pending" || r.status === "in_progress",
              ).length;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(o.id);
                      setTab("revisions");
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/[0.03] ${
                      selectedId === o.id ? "bg-white/[0.05]" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {o.title || o.categoryName}
                    </p>
                    <p className="text-[11px] text-white/45">
                      {o.orderId} · {o.customerName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="gold">{o.packageName}</Badge>
                      <Badge tone="blue">
                        {o.revisionsUsed}/{o.revisionLimit} revs
                      </Badge>
                      <Badge tone={openRevs ? "coral" : "neutral"}>
                        {openRevs} open
                      </Badge>
                      <Badge tone="green">{tasksN} tasks</Badge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </AdminCard>

        {!project ? (
          <AdminCard className="p-6 text-sm text-white/40">
            Select a project.
          </AdminCard>
        ) : (
          <div className="space-y-4">
            <AdminCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#00a581]">
                    {project.orderId}
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    {project.title || project.categoryName}
                  </h2>
                  <p className="mt-1 text-sm text-white/55">
                    {project.customerName} · {project.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#5ee0bf]">
                    {money(project.amount)}
                  </p>
                  <p className="text-xs capitalize text-white/40">
                    {project.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/50">
                <span>
                  Revisions {project.revisionsUsed}/{project.revisionLimit}
                </span>
                <span>·</span>
                <span>{projectTasks.length} project tasks</span>
                <span>·</span>
                <span>
                  {(project.assignedDesignerIds || []).length} assigned
                  designers
                </span>
              </div>
              {(project.assignedDesignerIds || []).length > 0 ? (
                <p className="mt-2 text-[11px] text-[#7ec4f0]">
                  IDs: {project.assignedDesignerIds.join(", ")}
                  {" · "}
                  <Link
                    href="/admin/designers"
                    className="underline hover:text-white"
                  >
                    Manage in Designers
                  </Link>
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-white/35">
                  No designer assigned yet —{" "}
                  <Link
                    href="/admin/designers"
                    className="text-[#00a581] underline"
                  >
                    assign from Designers
                  </Link>
                </p>
              )}
            </AdminCard>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["revisions", "Revisions"],
                  ["tasks", "Tasks"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    tab === id
                      ? "bg-[#00a581] text-white"
                      : "border border-white/10 text-white/60"
                  }`}
                >
                  {label}
                </button>
              ))}
              {tab === "revisions" ? (
                <button
                  type="button"
                  onClick={() => setRevOpen(true)}
                  disabled={
                    (project.revisions?.length || 0) >= project.revisionLimit
                  }
                  className="ml-auto rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  + Add revision round
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    setTaskDraft((t) => ({
                      ...t,
                      dueAt: d.toISOString().slice(0, 10),
                    }));
                    setTaskOpen(true);
                  }}
                  className="ml-auto rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  + Project task
                </button>
              )}
            </div>

            {tab === "revisions" ? (
              <div className="space-y-2">
                {(project.revisions || []).length === 0 ? (
                  <AdminCard className="p-6 text-center text-sm text-white/40">
                    No revision rounds yet. Customer portal requests or admin
                    can add rounds (max {project.revisionLimit}).
                  </AdminCard>
                ) : (
                  [...project.revisions]
                    .sort((a, b) => b.round - a.round)
                    .map((r) => (
                      <AdminCard key={r.id} className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone="gold">Round {r.round}</Badge>
                              <Badge
                                tone={
                                  r.status === "delivered" ||
                                  r.status === "closed"
                                    ? "green"
                                    : r.status === "pending"
                                      ? "coral"
                                      : "blue"
                                }
                              >
                                {r.status}
                              </Badge>
                              <Badge tone="neutral">{r.requestedBy}</Badge>
                            </div>
                            <p className="mt-2 font-medium text-white">
                              {r.title}
                            </p>
                            <p className="mt-1 text-sm text-white/60 whitespace-pre-wrap">
                              {r.note}
                            </p>
                            {r.adminReply ? (
                              <p className="mt-2 rounded-lg border border-[#00a581]/25 bg-[#00a581]/10 px-3 py-2 text-xs text-[#5ee0bf]">
                                Reply: {r.adminReply}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-white/35">
                            {relativeDay(r.createdAt)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <select
                            value={r.status}
                            onChange={(e) => {
                              updateProjectRevision(project.id, r.id, {
                                status: e.target
                                  .value as ProjectRevisionStatus,
                              });
                              refresh();
                            }}
                            className="rounded-lg border border-white/10 bg-[#0f1115] px-2 py-1.5 text-xs text-white"
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
                              const reply = window.prompt(
                                "Admin reply for this revision round:",
                                r.adminReply || "",
                              );
                              if (reply == null) return;
                              updateProjectRevision(project.id, r.id, {
                                adminReply: reply,
                                status: "delivered",
                              });
                              refresh();
                            }}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                          >
                            Reply &amp; deliver
                          </button>
                        </div>
                      </AdminCard>
                    ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <AdminCard className="p-6 text-center text-sm text-white/40">
                    No tasks on this project yet.
                  </AdminCard>
                ) : (
                  projectTasks.map((t) => (
                    <AdminCard key={t.id} className="p-4">
                      <div className="flex flex-wrap items-start gap-3">
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
                              ? "border-[#00a581] bg-[#00a581] text-white"
                              : "border-white/20"
                          }`}
                        >
                          {t.status === "done" ? "✓" : ""}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium ${
                              t.status === "done"
                                ? "text-white/40 line-through"
                                : "text-white"
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.notes ? (
                            <p className="mt-1 text-xs text-white/45">
                              {t.notes}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge
                              tone={
                                t.priority === "high" ? "coral" : "blue"
                              }
                            >
                              {t.priority}
                            </Badge>
                            <Badge tone="neutral">{t.status}</Badge>
                            <span className="text-xs text-white/40">
                              Due {relativeDay(t.dueAt)}
                            </span>
                          </div>
                        </div>
                        <select
                          value={t.status}
                          onChange={(e) => {
                            upsertTask({
                              ...t,
                              status: e.target.value as TaskStatus,
                            });
                            refresh();
                          }}
                          className="rounded-lg border border-white/10 bg-[#0f1115] px-2 py-1 text-xs text-white"
                        >
                          <option value="todo">todo</option>
                          <option value="doing">doing</option>
                          <option value="done">done</option>
                        </select>
                      </div>
                    </AdminCard>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {taskOpen && project ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onAddTask}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle title={`Task · ${project.orderId}`} />
            <label className="block text-xs text-white/50">
              Title
              <input
                required
                value={taskDraft.title}
                onChange={(e) =>
                  setTaskDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-xs text-white/50">
                Priority
                <select
                  value={taskDraft.priority}
                  onChange={(e) =>
                    setTaskDraft((d) => ({
                      ...d,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label className="block text-xs text-white/50">
                Due
                <input
                  type="date"
                  required
                  value={taskDraft.dueAt}
                  onChange={(e) =>
                    setTaskDraft((d) => ({ ...d, dueAt: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-white/50">
              Notes
              <textarea
                value={taskDraft.notes}
                onChange={(e) =>
                  setTaskDraft((d) => ({ ...d, notes: e.target.value }))
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
              >
                Save task
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {revOpen && project ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onAddRevision}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle
              title={`Revision R${(project.revisions?.length || 0) + 1}`}
            />
            <p className="mb-3 text-xs text-white/40">
              Limit {project.revisionLimit} rounds · used{" "}
              {project.revisionsUsed}
            </p>
            <label className="block text-xs text-white/50">
              Title
              <input
                value={revDraft.title}
                onChange={(e) =>
                  setRevDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="e.g. Logo spacing"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="mt-3 block text-xs text-white/50">
              Notes / brief
              <textarea
                required
                value={revDraft.note}
                onChange={(e) =>
                  setRevDraft((d) => ({ ...d, note: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
              >
                Create round
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
