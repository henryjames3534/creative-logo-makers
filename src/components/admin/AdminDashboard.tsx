"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  AdminCard,
  Badge,
  SectionTitle,
  StatCard,
} from "@/components/admin/AdminUi";
import { useHydratedCrm } from "@/components/admin/useHydratedCrm";
import {
  crmStats,
  DEAL_STAGES,
  loadCrm,
  money,
  onVisitorTracked,
  relativeDay,
} from "@/lib/crm-storage";

export function AdminDashboard() {
  const [state, setState] = useHydratedCrm();

  useEffect(() => {
    return onVisitorTracked(() => setState(loadCrm()));
  }, [setState]);

  const stats = useMemo(
    () => (state ? crmStats(state) : null),
    [state],
  );

  if (!state || !stats) {
    return <p className="text-[color:var(--a-muted)]">Loading dashboard…</p>;
  }

  const upcoming = [...state.tasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))
    .slice(0, 6);

  const recent = state.activities.slice(0, 8);
  const hotLeads = [...state.leads]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)] md:text-3xl">
          CRM Dashboard
        </h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          Pipeline, leads, orders, and team follow-ups in one place.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open pipeline"
          value={money(stats.pipeline)}
          hint={`${stats.openDeals} open deals`}
        />
        <StatCard
          label="Weighted forecast"
          value={money(stats.weighted)}
          hint="Probability-adjusted"
          accent="text-[#7ec4f0]"
        />
        <StatCard
          label="Won revenue"
          value={money(stats.wonValue)}
          hint={`${stats.wonCount} closed deals`}
          accent="text-[#e2c589]"
        />
        <StatCard
          label="Paid orders"
          value={money(stats.ordersRevenue)}
          hint={`${stats.ordersCount} marketplace orders`}
          accent="text-[#ff9a90]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitors"
          value={String(stats.visitors)}
          hint="Emails from Google / login"
          accent="text-[#7ec4f0]"
        />
        <StatCard
          label="Support inbox"
          value={String(stats.inboxOpen)}
          hint="Open revisions & messages"
          accent="text-[#ff9a90]"
        />
        <StatCard
          label="New leads"
          value={String(stats.newLeads)}
          hint={`${stats.totalLeads} total`}
        />
        <StatCard
          label="Open tasks"
          value={String(stats.openTasks)}
          hint={`${stats.overdueTasks} overdue`}
          accent={stats.overdueTasks ? "text-[#ff9a90]" : "text-[#00a581]"}
        />
      </div>

      {(state.visitors?.length ?? 0) > 0 ? (
        <AdminCard className="p-5">
          <SectionTitle
            title="Latest visitor emails"
            action={
              <Link
                href="/admin/visitors"
                className="text-xs font-semibold text-[#00a581] hover:underline"
              >
                View all
              </Link>
            }
          />
          <ul className="space-y-2">
            {[...(state.visitors || [])]
              .sort(
                (a, b) =>
                  +new Date(b.lastSeenAt) - +new Date(a.lastSeenAt),
              )
              .slice(0, 6)
              .map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--a-border)] py-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--a-text)]">
                      {v.email}
                    </p>
                    <p className="text-[11px] text-[color:var(--a-faint)]">
                      {v.name} · {v.source.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={v.signedIn ? "green" : "coral"}>
                      {v.signedIn ? "signed in" : "not signed in"}
                    </Badge>
                    <span className="text-xs text-[color:var(--a-faint)]">
                      {relativeDay(v.lastSeenAt)}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </AdminCard>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard className="p-5">
          <SectionTitle
            title="Pipeline by stage"
            action={
              <Link
                href="/admin/pipeline"
                className="text-xs font-semibold text-[#00a581] hover:underline"
              >
                Open board →
              </Link>
            }
          />
          <div className="space-y-3">
            {DEAL_STAGES.filter((s) => s.id !== "lost").map((stage) => {
              const deals = state.deals.filter((d) => d.stage === stage.id);
              const value = deals.reduce((s, d) => s + d.value, 0);
              const max = Math.max(stats.pipeline, 1);
              return (
                <div key={stage.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[color:var(--a-muted)]">{stage.label}</span>
                    <span className="text-[color:var(--a-faint)]">
                      {deals.length} · {money(value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--a-hover)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (value / max) * 100)}%`,
                        background: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <SectionTitle
            title="Hot leads"
            action={
              <Link
                href="/admin/leads"
                className="text-xs font-semibold text-[#00a581] hover:underline"
              >
                All leads →
              </Link>
            }
          />
          <ul className="space-y-3">
            {hotLeads.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--a-border)] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--a-text)]">
                    {l.name}
                  </p>
                  <p className="truncate text-xs text-[color:var(--a-faint)]">
                    {l.interest} · {l.source}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={l.score >= 80 ? "green" : "blue"}>
                    {l.score}
                  </Badge>
                  <p className="mt-1 text-xs text-[color:var(--a-muted)]">
                    {money(l.valueEstimate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard className="p-5">
          <SectionTitle
            title="Tasks due"
            action={
              <Link
                href="/admin/tasks"
                className="text-xs font-semibold text-[#00a581] hover:underline"
              >
                Manage →
              </Link>
            }
          />
          <ul className="space-y-2">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-[var(--a-hover)]"
              >
                <div>
                  <p className="text-sm text-[var(--a-text)]">{t.title}</p>
                  <p className="text-xs text-[color:var(--a-faint)]">
                    {relativeDay(t.dueAt)} · {t.priority}
                  </p>
                </div>
                <Badge
                  tone={
                    t.priority === "high"
                      ? "coral"
                      : t.priority === "medium"
                        ? "gold"
                        : "neutral"
                  }
                >
                  {t.status}
                </Badge>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="p-5">
          <SectionTitle
            title="Recent activity"
            action={
              <Link
                href="/admin/activity"
                className="text-xs font-semibold text-[#00a581] hover:underline"
              >
                Feed →
              </Link>
            }
          />
          <ul className="space-y-3">
            {recent.map((a) => (
              <li key={a.id} className="border-b border-[color:var(--a-border)] pb-3 last:border-0">
                <p className="text-sm font-medium text-[var(--a-text)]">{a.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--a-faint)]">
                  {a.body}
                </p>
                <p className="mt-1 text-[11px] text-[color:var(--a-faint)]">
                  {a.type} · {relativeDay(a.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
