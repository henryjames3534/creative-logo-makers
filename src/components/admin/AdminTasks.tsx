"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  loadCrm,
  relativeDay,
  upsertTask,
  type CrmState,
  type CrmTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/crm-storage";

export function AdminTasks() {
  const [state, setState] = useState<CrmState | null>(null);
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmTask | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueAt: "",
  });

  useEffect(() => {
    setState(loadCrm());
  }, []);

  const rows = useMemo(() => {
    if (!state) return [];
    return [...state.tasks]
      .filter((t) => (status === "all" ? true : t.status === status))
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [state, status]);

  function openCreate() {
    setEditing(null);
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setDraft({
      title: "",
      status: "todo",
      priority: "medium",
      dueAt: d.toISOString().slice(0, 10),
    });
    setFormOpen(true);
  }

  function openEdit(t: CrmTask) {
    setEditing(t);
    setDraft({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueAt: t.dueAt.slice(0, 10),
    });
    setFormOpen(true);
  }

  function quickDone(t: CrmTask) {
    const next = upsertTask({
      ...t,
      status: t.status === "done" ? "todo" : "done",
    });
    setState({ ...next });
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertTask({
      id: editing?.id,
      title: draft.title,
      status: draft.status,
      priority: draft.priority,
      dueAt: new Date(draft.dueAt).toISOString(),
      ownerId: editing?.ownerId || "own_admin",
      relatedType: editing?.relatedType,
      relatedId: editing?.relatedId,
    });
    setState({ ...next });
    setFormOpen(false);
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  const ownerMap = new Map(state.owners.map((o) => [o.id, o.name]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-white/50">
            Follow-ups, calls, and ops checklists.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New task
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "todo", "doing", "done"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              status === s
                ? "bg-[#00a581] text-white"
                : "border border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((t) => {
          const overdue =
            t.status !== "done" && new Date(t.dueAt) < new Date();
          return (
            <AdminCard key={t.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <button
                  type="button"
                  onClick={() => quickDone(t)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    t.status === "done"
                      ? "border-[#00a581] bg-[#00a581] text-white"
                      : "border-white/20"
                  }`}
                  aria-label="Toggle done"
                >
                  {t.status === "done" ? "✓" : ""}
                </button>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => openEdit(t)}
                >
                  <p
                    className={`font-medium ${
                      t.status === "done"
                        ? "text-white/40 line-through"
                        : "text-white"
                    }`}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge
                      tone={
                        t.priority === "high"
                          ? "coral"
                          : t.priority === "low"
                            ? "neutral"
                            : "blue"
                      }
                    >
                      {t.priority}
                    </Badge>
                    <Badge
                      tone={
                        t.status === "done"
                          ? "green"
                          : t.status === "doing"
                            ? "gold"
                            : "neutral"
                      }
                    >
                      {t.status}
                    </Badge>
                    <span
                      className={`text-xs ${
                        overdue ? "text-[#ff9a90]" : "text-white/40"
                      }`}
                    >
                      Due {relativeDay(t.dueAt)}
                    </span>
                    <span className="text-xs text-white/30">
                      ·{" "}
                      {t.designerName
                        ? `Designer: ${t.designerName}`
                        : ownerMap.get(t.ownerId) || "Unassigned"}
                    </span>
                  </div>
                </button>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onSave}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle title={editing ? "Edit task" : "New task"} />
            <label className="block text-xs text-white/50">
              Title
              <input
                required
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-xs text-white/50">
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  <option value="todo">Todo</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label className="block text-xs text-white/50">
                Priority
                <select
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <label className="mt-3 block text-xs text-white/50">
              Due date
              <input
                type="date"
                required
                value={draft.dueAt}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, dueAt: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
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
    </div>
  );
}
