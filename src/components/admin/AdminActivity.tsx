"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  addActivity,
  loadCrm,
  relativeDay,
  type ActivityType,
  type CrmState,
} from "@/lib/crm-storage";

const TYPES: ActivityType[] = [
  "note",
  "call",
  "email",
  "meeting",
  "status",
  "deal",
  "task",
  "revision",
];

export function AdminActivity() {
  const [state, setState] = useState<CrmState | null>(null);
  const [type, setType] = useState<ActivityType | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({
    type: "note" as ActivityType,
    title: "",
    body: "",
  });

  useEffect(() => {
    setState(loadCrm());
  }, []);

  const ownerMap = useMemo(() => {
    const m = new Map<string, string>();
    state?.owners.forEach((o) => m.set(o.id, o.name));
    return m;
  }, [state]);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.activities.filter((a) =>
      type === "all" ? true : a.type === type,
    );
  }, [state, type]);

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = addActivity({
      type: draft.type,
      title: draft.title,
      body: draft.body,
      ownerId: "own_admin",
    });
    setState({ ...next });
    setFormOpen(false);
    setDraft({ type: "note", title: "", body: "" });
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Activity feed</h1>
          <p className="mt-1 text-sm text-white/50">
            Calls, emails, notes, and pipeline events.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + Log activity
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setType("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            type === "all"
              ? "bg-[#00a581] text-white"
              : "border border-white/10 text-white/60"
          }`}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              type === t
                ? "bg-[#00a581] text-white"
                : "border border-white/10 text-white/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((a) => (
          <AdminCard key={a.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      a.type === "call"
                        ? "blue"
                        : a.type === "email"
                          ? "gold"
                          : a.type === "deal"
                            ? "green"
                            : a.type === "meeting"
                              ? "coral"
                              : "neutral"
                    }
                  >
                    {a.type}
                  </Badge>
                  <p className="font-medium text-white">{a.title}</p>
                </div>
                <p className="mt-1.5 text-sm text-white/55">{a.body}</p>
              </div>
              <div className="text-right text-xs text-white/35">
                <p>{relativeDay(a.createdAt)}</p>
                <p className="mt-0.5">{ownerMap.get(a.ownerId)}</p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onSave}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle title="Log activity" />
            <label className="block text-xs text-white/50">
              Type
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    type: e.target.value as ActivityType,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-white/50">
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
            <label className="mt-3 block text-xs text-white/50">
              Details
              <textarea
                required
                value={draft.body}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, body: e.target.value }))
                }
                rows={4}
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
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
