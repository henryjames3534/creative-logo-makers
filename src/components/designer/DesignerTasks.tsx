"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadCrm,
  onInboxUpdated,
  relativeDay,
  upsertTask,
} from "@/lib/crm-storage";
import {
  getDesignerSession,
  getDesignerWorkload,
  type DesignerSession,
} from "@/lib/designer-session";

export function DesignerTasks() {
  const [session, setSession] = useState<DesignerSession | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSession(getDesignerSession());
    return onInboxUpdated(() => setTick((t) => t + 1));
  }, []);

  const work = useMemo(() => {
    if (!session) return null;
    return getDesignerWorkload(session.designerId, loadCrm());
  }, [session, tick]);

  const projects = useMemo(() => {
    return Object.fromEntries(
      loadCrm().orders.map((o) => [o.id, o.title || o.orderId]),
    );
  }, [tick]);

  if (!session || !work) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">My tasks</h1>
        <p className="mt-1 text-sm text-white/50">
          Tasks Admin assigned to you (with or without a project).
        </p>
      </div>

      {work.tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">
          No tasks assigned.
        </p>
      ) : (
        <ul className="space-y-2">
          {work.tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#141a28] px-4 py-3"
            >
              <button
                type="button"
                onClick={() => {
                  upsertTask({
                    ...t,
                    status: t.status === "done" ? "todo" : "done",
                  });
                  setTick((x) => x + 1);
                }}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  t.status === "done"
                    ? "border-[#5b8def] bg-[#5b8def] text-white"
                    : "border-white/20"
                }`}
              >
                {t.status === "done" ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    t.status === "done"
                      ? "text-white/40 line-through"
                      : "text-white"
                  }`}
                >
                  {t.title}
                </p>
                {t.notes ? (
                  <p className="mt-1 text-xs text-white/45">{t.notes}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-white/40">
                  {t.priority} · Due {relativeDay(t.dueAt)}
                  {t.projectId
                    ? ` · ${projects[t.projectId] || "Project"}`
                    : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
