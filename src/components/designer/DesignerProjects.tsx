"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCrm, money, onInboxUpdated, relativeDay } from "@/lib/crm-storage";
import {
  getDesignerSession,
  getDesignerWorkload,
  type DesignerSession,
} from "@/lib/designer-session";

export function DesignerProjects() {
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

  if (!session || !work) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">My projects</h1>
        <p className="mt-1 text-sm text-white/50">
          Contests / projects Admin assigned to you — revisions sync live.
        </p>
      </div>

      {work.projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">
          No assignments yet. Ask admin to use Assign project on /admin/designers.
        </p>
      ) : (
        <div className="space-y-3">
          {work.projects.map(({ project, openRevisions, tasks, allRevisions }) => (
            <Link
              key={project.id}
              href={`/designer/projects/${project.id}`}
              className="block rounded-2xl border border-white/10 bg-[#141a28] p-5 transition hover:border-[#5b8def]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b8def]">
                    {project.orderId}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {project.title || project.categoryName}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {project.customerName} · {project.packageName} ·{" "}
                    {money(project.amount)}
                  </p>
                </div>
                <p className="text-xs capitalize text-white/40">
                  {project.status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/55">
                <span>
                  {openRevisions.length} open / {allRevisions.length} total
                  revisions
                </span>
                <span>·</span>
                <span>
                  {tasks.filter((t) => t.status !== "done").length} open tasks
                </span>
                <span>·</span>
                <span>Updated {relativeDay(project.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
