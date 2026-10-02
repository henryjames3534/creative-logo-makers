"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminCard, Badge, DeleteBtn, SectionTitle } from "@/components/admin/AdminUi";
import { useHydratedCrm } from "@/components/admin/useHydratedCrm";
import {
  addProjectRevision,
  cancelUpsell,
  createProjectUpsell,
  deleteOrder,
  hydrateCrmFromServer,
  isPaidProject,
  loadCrm,
  markUpsellPaid,
  money,
  onInboxUpdated,
  projectFinancials,
  relativeDay,
  saveCrm,
  updateProjectRevision,
  upsertTask,
  type CrmOrder,
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
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [state, setState] = useHydratedCrm();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"tasks" | "revisions" | "upsells">("revisions");

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

  const [upsellOpen, setUpsellOpen] = useState(false);
  const [upsellBusy, setUpsellBusy] = useState(false);
  const [upsellDraft, setUpsellDraft] = useState({
    title: "",
    details: "",
    amount: "",
  });

  useEffect(() => {
    return onInboxUpdated(() => setState(loadCrm()));
  }, [setState]);

  useEffect(() => {
    if (focusId) {
      setSelectedId(focusId);
      return;
    }
    const paid = (state?.orders || []).filter(isPaidProject);
    if (!selectedId && paid[0]) setSelectedId(paid[0].id);
  }, [state, selectedId, focusId]);

  const projects = useMemo(() => {
    if (!state) return [];
    return state.orders.filter((o) => {
      if (!isPaidProject(o)) return false;
      const hay =
        `${o.orderId} ${o.title ?? ""} ${o.customerName} ${o.customerEmail} ${o.categoryName}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q]);

  const project: CrmOrder | null = useMemo(() => {
    if (!state || !selectedId) return null;
    const o = state.orders.find((x) => x.id === selectedId) || null;
    if (o && !isPaidProject(o)) return null;
    return o;
  }, [state, selectedId]);

  const finance = useMemo(
    () => (project ? projectFinancials(project) : null),
    [project],
  );

  const projectTasks: CrmTask[] = useMemo(() => {
    if (!state || !project) return [];
    return state.tasks
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [state, project]);

  function refresh() {
    setState(loadCrm());
  }

  function onDeleteProject() {
    if (!project) return;
    if (
      !window.confirm(
        `Delete project ${project.orderId} (${project.customerName})?\n\nPipeline deal + linked lead for this project will also be removed.`,
      )
    ) {
      return;
    }
    const next = deleteOrder(project.id);
    setState({ ...next });
    setSelectedId(next.orders[0]?.id ?? null);
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

  async function onAddUpsell(e: FormEvent) {
    e.preventDefault();
    if (!project || upsellBusy) return;
    const title = upsellDraft.title.trim();
    const details = upsellDraft.details.trim();
    const amount = Number(upsellDraft.amount);
    if (!title || !(amount > 0)) {
      window.alert("Title and amount (> 0) required.");
      return;
    }
    setUpsellBusy(true);
    try {
      const res = await fetch("/api/crm/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          orderId: project.orderId,
          title,
          details,
          amount,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        emailed?: boolean;
        emailError?: string;
        upsell?: {
          id: string;
          title: string;
          details: string;
          amount: number;
          currency: string;
          status: "draft" | "invoiced" | "paid" | "cancelled";
          invoicedAt?: string;
          createdAt: string;
          updatedAt: string;
          payToken?: string;
          createdBy?: string;
        };
      };
      if (res.ok && json.ok && json.upsell) {
        // Patch local CRM with the exact server upsell (same id/token)
        const live = loadCrm();
        const i = live.orders.findIndex((o) => o.id === project.id);
        if (i >= 0) {
          const existing = live.orders[i].upsells || [];
          if (!existing.some((u) => u.id === json.upsell!.id)) {
            live.orders[i] = {
              ...live.orders[i],
              upsells: [json.upsell, ...existing],
              updatedAt: new Date().toISOString(),
            };
            saveCrm(live);
          }
        }
        await hydrateCrmFromServer().catch(() => null);
        const mailNote = json.emailed
          ? "Invoice emailed to customer."
          : json.emailError
            ? `Saved — email not sent: ${json.emailError}`
            : "Saved. Customer will see it on portal if signed up.";
        window.alert(mailNote);
      } else {
        createProjectUpsell({
          projectId: project.id,
          title,
          details,
          amount,
        });
        window.alert(
          `Saved locally. Server sync failed: ${json.error || res.status}${
            json.emailError ? `\nEmail: ${json.emailError}` : ""
          }`,
        );
      }
      setUpsellOpen(false);
      setUpsellDraft({ title: "", details: "", amount: "" });
      refresh();
    } catch (err) {
      createProjectUpsell({
        projectId: project.id,
        title,
        details,
        amount,
      });
      window.alert(
        `Saved locally. Network error: ${
          err instanceof Error ? err.message : "unknown"
        }`,
      );
      setUpsellOpen(false);
      setUpsellDraft({ title: "", details: "", amount: "" });
      refresh();
    } finally {
      setUpsellBusy(false);
    }
  }

  async function onMarkUpsellPaid(upsellId: string, payToken?: string) {
    if (!project) return;
    try {
      await fetch("/api/crm/upsell/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          upsellId,
          token: payToken,
        }),
      });
    } catch {
      /* local mark below */
    }
    markUpsellPaid({ projectId: project.id, upsellId, payToken });
    await hydrateCrmFromServer().catch(() => null);
    refresh();
  }

  function onCancelUpsell(upsellId: string) {
    if (!project) return;
    if (!window.confirm("Cancel this upsell invoice?")) return;
    cancelUpsell({ projectId: project.id, upsellId });
    refresh();
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">Projects</h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          Paid projects — tasks, revisions, upsells. Unpaid briefs stay in Orders
          + Leads.
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects…"
        className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.3fr]">
        <AdminCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {projects.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[color:var(--a-faint)]">
                Abhi koi paid project nahi. Orders mein payment{" "}
                <span className="text-[color:var(--a-muted)]">paid</span> mark
                karo — yahan aa jayega.
              </li>
            ) : null}
            {projects.map((o) => {
              const tasksN = state.tasks.filter((t) => t.projectId === o.id)
                .length;
              const openRevs = (o.revisions || []).filter(
                (r) => r.status === "pending" || r.status === "in_progress",
              ).length;
              const fin = projectFinancials(o);
              const openUpsells = fin.openUpsells.length;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(o.id);
                      setTab("revisions");
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-[var(--a-hover)] ${
                      selectedId === o.id ? "bg-white/[0.05]" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--a-text)]">
                      {o.title || o.categoryName}
                    </p>
                    <p className="text-[11px] text-[color:var(--a-faint)]">
                      {o.orderId} · {o.customerName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="gold">{o.packageName}</Badge>
                      <Badge tone="green">{money(fin.projectTotal)}</Badge>
                      <Badge tone="blue">
                        {o.revisionsUsed}/{o.revisionLimit} revs
                      </Badge>
                      <Badge tone={openRevs ? "coral" : "neutral"}>
                        {openRevs} open
                      </Badge>
                      {openUpsells ? (
                        <Badge tone="coral">{openUpsells} upsell</Badge>
                      ) : null}
                      <Badge tone="neutral">{tasksN} tasks</Badge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </AdminCard>

        {!project ? (
          <AdminCard className="p-6 text-sm text-[color:var(--a-faint)]">
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
                  <h2 className="text-xl font-semibold text-[var(--a-text)]">
                    {project.title || project.categoryName}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--a-muted)]">
                    {project.customerName} · {project.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#5ee0bf]">
                    {money(finance?.projectTotal ?? project.amount)}
                  </p>
                  <p className="text-xs text-[color:var(--a-faint)]">
                    Base {money(project.amount)}
                    {(finance?.paidUpsellsTotal || 0) > 0
                      ? ` + upsells ${money(finance!.paidUpsellsTotal)}`
                      : ""}
                  </p>
                  <p className="text-xs capitalize text-[color:var(--a-faint)]">
                    {project.status.replace(/_/g, " ")}
                  </p>
                  <DeleteBtn
                    label="Delete project"
                    className="mt-2"
                    onClick={() => onDeleteProject()}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--a-muted)]">
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
                <span>·</span>
                <span>
                  {(project.upsells || []).length} upsells
                  {(finance?.openUpsellsTotal || 0) > 0
                    ? ` · open ${money(finance!.openUpsellsTotal)}`
                    : ""}
                </span>
              </div>
              {(project.assignedDesignerIds || []).length > 0 ? (
                <p className="mt-2 text-[11px] text-[#7ec4f0]">
                  IDs: {project.assignedDesignerIds.join(", ")}
                  {" · "}
                  <Link
                    href="/admin/designers"
                    className="underline hover:text-[var(--a-text)]"
                  >
                    Manage in Designers
                  </Link>
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-[color:var(--a-faint)]">
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
                  ["upsells", "Upsells"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    tab === id
                      ? "bg-[#00a581] text-white"
                      : "border border-[color:var(--a-border)] text-[color:var(--a-muted)]"
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
              ) : tab === "tasks" ? (
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
              ) : (
                <button
                  type="button"
                  onClick={() => setUpsellOpen(true)}
                  className="ml-auto rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  + Create upsell
                </button>
              )}
            </div>

            {tab === "revisions" ? (
              <div className="space-y-2">
                {(project.revisions || []).length === 0 ? (
                  <AdminCard className="p-6 text-center text-sm text-[color:var(--a-faint)]">
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
                            <p className="mt-2 font-medium text-[var(--a-text)]">
                              {r.title}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--a-muted)]">
                              {r.note}
                            </p>
                            {r.adminReply ? (
                              <p className="mt-2 rounded-lg border border-[#00a581]/25 bg-[#00a581]/10 px-3 py-2 text-xs text-[#5ee0bf]">
                                Reply: {r.adminReply}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-[color:var(--a-faint)]">
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
                            className="rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-2 py-1.5 text-xs text-[var(--a-text)]"
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
                            className="rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                          >
                            Reply &amp; deliver
                          </button>
                        </div>
                      </AdminCard>
                    ))
                )}
              </div>
            ) : tab === "tasks" ? (
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <AdminCard className="p-6 text-center text-sm text-[color:var(--a-faint)]">
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
                                ? "text-[color:var(--a-faint)] line-through"
                                : "text-[var(--a-text)]"
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.notes ? (
                            <p className="mt-1 text-xs text-[color:var(--a-faint)]">
                              {t.notes}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge
                              tone={t.priority === "high" ? "coral" : "blue"}
                            >
                              {t.priority}
                            </Badge>
                            <Badge tone="neutral">{t.status}</Badge>
                            <span className="text-xs text-[color:var(--a-faint)]">
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
                          className="rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-2 py-1 text-xs text-[var(--a-text)]"
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
            ) : (
              <div className="space-y-3">
                {finance ? (
                  <AdminCard className="p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                          Base package
                        </p>
                        <p className="mt-1 text-lg font-bold text-[var(--a-text)]">
                          {money(finance.base)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                          Paid upsells
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#5ee0bf]">
                          {money(finance.paidUpsellsTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                          Project total
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#00a581]">
                          {money(finance.projectTotal)}
                        </p>
                      </div>
                    </div>
                    {(finance.openUpsellsTotal || 0) > 0 ? (
                      <p className="mt-3 text-xs text-[#f0b27a]">
                        Open invoices: {money(finance.openUpsellsTotal)} (not
                        in project total until paid)
                      </p>
                    ) : null}
                  </AdminCard>
                ) : null}

                {(project.upsells || []).length === 0 ? (
                  <AdminCard className="p-6 text-center text-sm text-[color:var(--a-faint)]">
                    No upsells yet. Create an invoice — customer gets email +
                    portal entry (if signed up). Paid upsells nest under this
                    project.
                  </AdminCard>
                ) : (
                  [...(project.upsells || [])]
                    .sort(
                      (a, b) =>
                        +new Date(b.createdAt) - +new Date(a.createdAt),
                    )
                    .map((u) => (
                      <AdminCard key={u.id} className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                tone={
                                  u.status === "paid"
                                    ? "green"
                                    : u.status === "cancelled"
                                      ? "neutral"
                                      : "coral"
                                }
                              >
                                {u.status}
                              </Badge>
                              <Badge tone="gold">{money(u.amount)}</Badge>
                            </div>
                            <p className="mt-2 font-medium text-[var(--a-text)]">
                              {u.title}
                            </p>
                            {u.details ? (
                              <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--a-muted)]">
                                {u.details}
                              </p>
                            ) : null}
                            {u.payToken && u.status !== "paid" ? (
                              <p className="mt-2 text-[11px] text-[#7ec4f0]">
                                Pay link: /pay/upsell?token={u.payToken}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-[color:var(--a-faint)]">
                            {relativeDay(u.createdAt)}
                            {u.paidAt ? ` · paid ${relativeDay(u.paidAt)}` : ""}
                          </p>
                        </div>
                        {u.status === "invoiced" || u.status === "draft" ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onMarkUpsellPaid(u.id, u.payToken)
                              }
                              className="rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              onClick={() => onCancelUpsell(u.id)}
                              className="rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : null}
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
            className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-6"
          >
            <SectionTitle title={`Task · ${project.orderId}`} />
            <label className="block text-xs text-[color:var(--a-muted)]">
              Title
              <input
                required
                value={taskDraft.title}
                onChange={(e) =>
                  setTaskDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-xs text-[color:var(--a-muted)]">
                Priority
                <select
                  value={taskDraft.priority}
                  onChange={(e) =>
                    setTaskDraft((d) => ({
                      ...d,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label className="block text-xs text-[color:var(--a-muted)]">
                Due
                <input
                  type="date"
                  required
                  value={taskDraft.dueAt}
                  onChange={(e) =>
                    setTaskDraft((d) => ({ ...d, dueAt: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Notes
              <textarea
                value={taskDraft.notes}
                onChange={(e) =>
                  setTaskDraft((d) => ({ ...d, notes: e.target.value }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskOpen(false)}
                className="rounded-full px-3 py-1.5 text-xs text-[color:var(--a-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
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
            className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-6"
          >
            <SectionTitle
              title={`Revision R${(project.revisions?.length || 0) + 1}`}
            />
            <p className="mb-3 text-xs text-[color:var(--a-faint)]">
              Limit {project.revisionLimit} rounds · used {project.revisionsUsed}
            </p>
            <label className="block text-xs text-[color:var(--a-muted)]">
              Title
              <input
                value={revDraft.title}
                onChange={(e) =>
                  setRevDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Note
              <textarea
                required
                value={revDraft.note}
                onChange={(e) =>
                  setRevDraft((d) => ({ ...d, note: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevOpen(false)}
                className="rounded-full px-3 py-1.5 text-xs text-[color:var(--a-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Add round
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {upsellOpen && project ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onAddUpsell}
            className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-6"
          >
            <SectionTitle title={`Upsell · ${project.orderId}`} />
            <p className="mb-3 text-xs text-[color:var(--a-faint)]">
              Invoice goes to {project.customerEmail} + portal (if signed up).
            </p>
            <label className="block text-xs text-[color:var(--a-muted)]">
              Title
              <input
                required
                value={upsellDraft.title}
                onChange={(e) =>
                  setUpsellDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="Extra revision pack / stationery / rush fee"
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Details
              <textarea
                value={upsellDraft.details}
                onChange={(e) =>
                  setUpsellDraft((d) => ({ ...d, details: e.target.value }))
                }
                rows={4}
                placeholder="What is included, delivery notes…"
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Amount (USD)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={upsellDraft.amount}
                onChange={(e) =>
                  setUpsellDraft((d) => ({ ...d, amount: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpsellOpen(false)}
                disabled={upsellBusy}
                className="rounded-full px-3 py-1.5 text-xs text-[color:var(--a-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={upsellBusy}
                className="rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {upsellBusy ? "Sending…" : "Invoice & email"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
