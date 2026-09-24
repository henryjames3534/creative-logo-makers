"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  designers,
  levelLabel,
  type DesignerLevel,
  type DesignerProfile,
} from "@/data/designers";
import {
  assignDesignerToProject,
  assignTaskToDesigner,
  loadCrm,
  relativeDay,
  upsertDesignerNote,
  type CrmDesignerNote,
  type CrmState,
  type TaskPriority,
} from "@/lib/crm-storage";
import { safeDesignerImage } from "@/lib/designer-media";

const NOTE_STATUSES = ["active", "vip", "paused", "flagged"] as const;
const PAGE_SIZE = 24;

export function AdminDesigners() {
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<DesignerLevel | "all">("all");
  const [page, setPage] = useState(0);
  const [noteEdit, setNoteEdit] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState({
    status: "active" as CrmDesignerNote["status"],
    notes: "",
    tags: "",
  });

  const [assignFor, setAssignFor] = useState<DesignerProfile | null>(null);
  const [assignMode, setAssignMode] = useState<"project" | "task">("project");
  const [projectId, setProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [taskDue, setTaskDue] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = loadCrm();
    setState(s);
    if (s.orders[0]) setProjectId(s.orders[0].id);
  }, []);

  const noteMap = useMemo(() => {
    const m = new Map<string, CrmDesignerNote>();
    state?.designerNotes.forEach((n) => m.set(n.designerId, n));
    return m;
  }, [state]);

  const assignmentCount = useMemo(() => {
    const m = new Map<string, number>();
    state?.orders.forEach((o) => {
      (o.assignedDesignerIds || []).forEach((id) => {
        m.set(id, (m.get(id) || 0) + 1);
      });
    });
    state?.tasks.forEach((t) => {
      if (!t.designerId) return;
      m.set(t.designerId, (m.get(t.designerId) || 0) + 1);
    });
    return m;
  }, [state]);

  const filtered = useMemo(() => {
    return designers.filter((d) => {
      if (level !== "all" && d.level !== level) return false;
      const hay =
        `${d.name} ${d.handle} ${d.specialty} ${d.location} ${d.skills.join(" ")}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [q, level]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const rows = filtered.slice(
    pageSafe * PAGE_SIZE,
    pageSafe * PAGE_SIZE + PAGE_SIZE,
  );

  function openNote(designerId: string) {
    const n = noteMap.get(designerId);
    setNoteEdit(designerId);
    setNoteDraft({
      status: n?.status || "active",
      notes: n?.notes || "",
      tags: n?.tags.join(", ") || "",
    });
  }

  function saveNote(e: FormEvent) {
    e.preventDefault();
    if (!noteEdit) return;
    const next = upsertDesignerNote({
      designerId: noteEdit,
      status: noteDraft.status,
      notes: noteDraft.notes,
      tags: noteDraft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ownerId: "own_admin",
    });
    setState({ ...next });
    setNoteEdit(null);
  }

  function openAssign(d: DesignerProfile, mode: "project" | "task") {
    setAssignFor(d);
    setAssignMode(mode);
    setTaskTitle(
      mode === "task" ? `Work with ${d.name}` : `Kickoff — ${d.name}`,
    );
    const due = new Date();
    due.setDate(due.getDate() + 2);
    setTaskDue(due.toISOString().slice(0, 10));
    setTaskNotes("");
    setTaskPriority("medium");
    if (state?.orders[0]) setProjectId(state.orders[0].id);
    setMsg(null);
  }

  function onAssign(e: FormEvent) {
    e.preventDefault();
    if (!assignFor || !state) return;

    if (assignMode === "project") {
      if (!projectId) return;
      const next = assignDesignerToProject({
        projectId,
        designerId: assignFor.id,
        designerName: assignFor.name,
        createKickoffTask: true,
      });
      setState({ ...next });
      setMsg(
        `${assignFor.name} assigned to project + kickoff task created.`,
      );
    } else {
      const next = assignTaskToDesigner({
        title: taskTitle.trim() || `Task for ${assignFor.name}`,
        designerId: assignFor.id,
        designerName: assignFor.name,
        projectId: projectId || undefined,
        priority: taskPriority,
        dueAt: taskDue
          ? new Date(taskDue).toISOString()
          : undefined,
        notes: taskNotes || undefined,
      });
      setState({ ...next });
      setMsg(`Task assigned to ${assignFor.name}.`);
    }
    setAssignFor(null);
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Designers</h1>
        <p className="mt-1 text-sm text-white/50">
          Site pe listed saare {designers.length} designers — kisi ko bhi
          project / task assign karo.
        </p>
      </div>

      {msg ? (
        <p className="rounded-xl border border-[#00a581]/30 bg-[#00a581]/10 px-3 py-2 text-xs text-[#5ee0bf]">
          {msg}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search name, handle, skill, location…"
          className="min-w-0 flex-1 basis-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581] sm:min-w-[200px] sm:basis-auto"
        />
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value as DesignerLevel | "all");
            setPage(0);
          }}
          className="rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white"
        >
          <option value="all">All levels</option>
          <option value="top">Top</option>
          <option value="mid">Mid</option>
          <option value="entry">Entry</option>
        </select>
      </div>

      <p className="text-xs text-white/40">
        Showing {rows.length} of {filtered.length} designers
        {filtered.length !== designers.length
          ? ` (filtered from ${designers.length})`
          : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((d) => {
          const note = noteMap.get(d.id);
          const assigned = assignmentCount.get(d.id) || 0;
          return (
            <AdminCard key={d.id} className="overflow-hidden p-0">
              <div className="flex gap-3 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/5">
                  <Image
                    src={safeDesignerImage(d.avatar || d.image)}
                    alt={d.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {d.name}
                      </p>
                      <p className="text-xs text-white/45">@{d.handle}</p>
                    </div>
                    {note ? (
                      <Badge
                        tone={
                          note.status === "vip"
                            ? "gold"
                            : note.status === "flagged"
                              ? "coral"
                              : "green"
                        }
                      >
                        {note.status}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">{levelLabel(d.level)}</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-white/55">
                    {d.specialty} · {d.location}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    ★ {d.rating} · {d.projects} projects
                    {assigned ? ` · ${assigned} CRM assigns` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => openAssign(d, "project")}
                      className="rounded-full bg-[#00a581] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#008f70]"
                    >
                      Assign project
                    </button>
                    <button
                      type="button"
                      onClick={() => openAssign(d, "task")}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75 hover:bg-white/5"
                    >
                      Assign task
                    </button>
                    <button
                      type="button"
                      onClick={() => openNote(d.id)}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75 hover:bg-white/5"
                    >
                      CRM note
                    </button>
                    <Link
                      href={`/designer`}
                      className="rounded-full border border-[#5b8def]/40 px-2.5 py-1 text-[11px] font-medium text-[#9bbcf5] hover:bg-[#5b8def]/10"
                    >
                      Open portal
                    </Link>
                    <Link
                      href={`/designers/${d.id}`}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75 hover:bg-white/5"
                    >
                      Profile
                    </Link>
                  </div>
                  {note?.updatedAt ? (
                    <p className="mt-2 text-[10px] text-white/30">
                      Note {relativeDay(note.updatedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={pageSafe <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 disabled:opacity-35"
        >
          Prev
        </button>
        <span className="text-xs text-white/45">
          Page {pageSafe + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={pageSafe >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 disabled:opacity-35"
        >
          Next
        </button>
      </div>

      {noteEdit ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={saveNote}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle title="Designer CRM note" />
            <label className="block text-xs text-white/50">
              Status
              <select
                value={noteDraft.status}
                onChange={(e) =>
                  setNoteDraft((d) => ({
                    ...d,
                    status: e.target.value as CrmDesignerNote["status"],
                  }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              >
                {NOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-white/50">
              Tags
              <input
                value={noteDraft.tags}
                onChange={(e) =>
                  setNoteDraft((d) => ({ ...d, tags: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="mt-3 block text-xs text-white/50">
              Notes
              <textarea
                value={noteDraft.notes}
                onChange={(e) =>
                  setNoteDraft((d) => ({ ...d, notes: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteEdit(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {assignFor ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onAssign}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle
              title={
                assignMode === "project"
                  ? `Assign project → ${assignFor.name}`
                  : `Assign task → ${assignFor.name}`
              }
            />
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setAssignMode("project")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  assignMode === "project"
                    ? "bg-[#00a581] text-white"
                    : "border border-white/10 text-white/60"
                }`}
              >
                Project
              </button>
              <button
                type="button"
                onClick={() => setAssignMode("task")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  assignMode === "task"
                    ? "bg-[#00a581] text-white"
                    : "border border-white/10 text-white/60"
                }`}
              >
                Task
              </button>
            </div>

            <label className="block text-xs text-white/50">
              Project
              <select
                required={assignMode === "project"}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              >
                <option value="">
                  {assignMode === "task" ? "No project (optional)" : "Select…"}
                </option>
                {state.orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderId} — {o.title || o.categoryName}
                  </option>
                ))}
              </select>
            </label>

            {assignMode === "task" ? (
              <>
                <label className="mt-3 block text-xs text-white/50">
                  Task title
                  <input
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                  />
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block text-xs text-white/50">
                    Priority
                    <select
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(e.target.value as TaskPriority)
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
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>
                <label className="mt-3 block text-xs text-white/50">
                  Notes
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                  />
                </label>
              </>
            ) : (
              <p className="mt-3 text-xs text-white/45">
                Designer project pe assign hoga + automatic kickoff task ban
                jayega.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignFor(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
              >
                {assignMode === "project" ? "Assign designer" : "Create task"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
