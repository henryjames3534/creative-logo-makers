"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCrm, money, onInboxUpdated, relativeDay } from "@/lib/crm-storage";
import {
  getDesignerSession,
  getDesignerWorkload,
  type DesignerSession,
} from "@/lib/designer-session";

export function DesignerDashboard() {
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

  if (!session || !work) {
    return <p className="text-white/50">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          Your work
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Projects, tasks, and revisions assigned from Admin CRM appear here
          automatically.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Projects" value={String(work.projectCount)} />
        <Stat label="Open tasks" value={String(work.openTaskCount)} />
        <Stat
          label="Open revisions"
          value={String(work.openRevisionCount)}
          accent="text-[#ff9a90]"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active projects</h2>
          <Link
            href="/designer/projects"
            className="text-xs font-semibold text-[#5b8def] hover:underline"
          >
            View all
          </Link>
        </div>
        {work.projects.length === 0 ? (
          <Empty text="No projects assigned yet. Admin can assign you from /admin/designers." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {work.projects.slice(0, 4).map(({ project, openRevisions, tasks }) => (
              <Link
                key={project.id}
                href={`/designer/projects/${project.id}`}
                className="rounded-2xl border border-white/10 bg-[#141a28] p-4 transition hover:border-[#5b8def]/40"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b8def]">
                  {project.orderId}
                </p>
                <p className="mt-1 font-semibold text-white">
                  {project.title || project.categoryName}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {project.customerName} · {money(project.amount)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/50">
                  <span>{openRevisions.length} open revisions</span>
                  <span>·</span>
                  <span>
                    {tasks.filter((t) => t.status !== "done").length} open tasks
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Latest tasks</h2>
          <Link
            href="/designer/tasks"
            className="text-xs font-semibold text-[#5b8def] hover:underline"
          >
            View all
          </Link>
        </div>
        {work.tasks.length === 0 ? (
          <Empty text="No tasks yet." />
        ) : (
          <ul className="space-y-2">
            {work.tasks
              .filter((t) => t.status !== "done")
              .slice(0, 6)
              .map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-white/10 bg-[#141a28] px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{t.title}</p>
                  <p className="mt-1 text-[11px] text-white/40">
                    Due {relativeDay(t.dueAt)} · {t.priority}
                    {t.projectId ? " · linked project" : ""}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-[#5b8def]",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141a28] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
      {text}
    </p>
  );
}
