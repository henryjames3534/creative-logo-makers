"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminCard,
  Badge,
  SectionTitle,
  StatCard,
} from "@/components/admin/AdminUi";
import { useHydratedCrm } from "@/components/admin/useHydratedCrm";
import {
  listProjectPaymentGroups,
  money,
  relativeDay,
  type ProjectPaymentGroup,
} from "@/lib/crm-storage";

type Filter = "all" | "paid" | "open";

function statusTone(
  status: string,
): "green" | "coral" | "gold" | "blue" | "neutral" {
  const s = status.toLowerCase();
  if (s === "paid") return "green";
  if (s === "pending" || s === "invoiced") return "coral";
  if (s === "draft") return "blue";
  if (s === "refunded" || s === "cancelled") return "neutral";
  return "gold";
}

function projectHref(g: ProjectPaymentGroup) {
  if (g.paymentStatus === "paid") {
    return `/admin/projects?id=${encodeURIComponent(g.projectId)}`;
  }
  return `/admin/orders?id=${encodeURIComponent(g.projectId)}`;
}

export function AdminPayments() {
  const [state] = useHydratedCrm();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(
    () => listProjectPaymentGroups(state?.orders || []),
    [state],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return groups.filter((g) => {
      if (filter === "paid" && g.paidTotal <= 0) return false;
      if (filter === "open" && g.openTotal <= 0) return false;
      if (!needle) return true;
      const hay = [
        g.orderCode,
        g.customerName,
        g.customerEmail,
        g.projectTitle,
        g.packageName,
        g.categoryName,
        ...g.lines.map((l) => l.label),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [groups, q, filter]);

  const totals = useMemo(() => {
    const collected = groups.reduce((s, g) => s + g.paidTotal, 0);
    const open = groups.reduce((s, g) => s + g.openTotal, 0);
    const paidLines = groups.reduce(
      (s, g) =>
        s + g.lines.filter((l) => String(l.status).toLowerCase() === "paid").length,
      0,
    );
    return {
      collected,
      open,
      projects: groups.length,
      paidLines,
    };
  }, [groups]);

  if (!state) {
    return <p className="text-[color:var(--a-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">Payments</h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          Project-wise payment ledger — base package + upsells aligned under each
          project, with running total cost.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected"
          value={money(totals.collected)}
          hint={`${totals.paidLines} paid line${totals.paidLines === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Open / due"
          value={money(totals.open)}
          hint="Pending package + open upsell invoices"
          accent="text-[#fe5f50]"
        />
        <StatCard
          label="Projects"
          value={String(totals.projects)}
          hint="With any payment activity"
          accent="text-[#2486cb]"
        />
        <StatCard
          label="Showing"
          value={String(filtered.length)}
          hint={filter === "all" ? "All projects" : `Filter: ${filter}`}
          accent="text-[color:var(--a-muted)]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order, customer, upsell…"
          className="min-w-[220px] flex-1 rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
        />
        {(
          [
            ["all", "All"],
            ["paid", "Collected"],
            ["open", "Open"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === id
                ? "bg-[#00a581] text-white"
                : "border border-[color:var(--a-border)] text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <SectionTitle title="By project" />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <AdminCard className="px-4 py-10 text-center text-sm text-[color:var(--a-faint)]">
            No payments match this filter yet.
          </AdminCard>
        ) : null}

        {filtered.map((g) => {
          const expanded = openId === g.projectId;
          return (
            <AdminCard key={g.projectId} className="overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setOpenId(expanded ? null : g.projectId)
                }
                className="flex w-full flex-wrap items-start justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--a-hover)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--a-text)]">
                      {g.projectTitle}
                    </p>
                    <Badge tone={g.paymentStatus === "paid" ? "green" : "coral"}>
                      {g.paymentStatus === "paid" ? "project" : "order"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[color:var(--a-faint)]">
                    {g.orderCode} · {g.customerName} · {g.customerEmail}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="gold">{g.packageName}</Badge>
                    <Badge tone="neutral">
                      {g.lines.length} payment
                      {g.lines.length === 1 ? "" : "s"}
                    </Badge>
                    {g.openTotal > 0 ? (
                      <Badge tone="coral">due {money(g.openTotal)}</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--a-faint)]">
                    Project total
                  </p>
                  <p className="text-xl font-bold text-[#00a581]">
                    {money(g.projectTotal)}
                  </p>
                  {g.expectedTotal > g.projectTotal ? (
                    <p className="text-[11px] text-[color:var(--a-faint)]">
                      expected {money(g.expectedTotal)}
                    </p>
                  ) : null}
                  {g.lastPaidAt ? (
                    <p className="mt-1 text-[11px] text-[color:var(--a-faint)]">
                      last paid {relativeDay(g.lastPaidAt)}
                    </p>
                  ) : null}
                </div>
              </button>

              {expanded ? (
                <div className="border-t border-[color:var(--a-border)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] text-[color:var(--a-faint)]">
                    <span>
                      Collected {money(g.paidTotal)}
                      {g.openTotal > 0 ? ` · Open ${money(g.openTotal)}` : ""}
                    </span>
                    <Link
                      href={projectHref(g)}
                      className="font-semibold text-[#2486cb] hover:underline"
                    >
                      Open {g.paymentStatus === "paid" ? "project" : "order"} →
                    </Link>
                  </div>
                  <ul className="divide-y divide-white/5">
                    {g.lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-[var(--a-text)]">
                              {line.label}
                            </p>
                            <Badge
                              tone={line.kind === "package" ? "blue" : "gold"}
                            >
                              {line.kind}
                            </Badge>
                            <Badge tone={statusTone(line.status)}>
                              {line.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[color:var(--a-faint)]">
                            {line.paidAt
                              ? `Paid ${relativeDay(line.paidAt)}`
                              : `Created ${relativeDay(line.createdAt)}`}
                            {line.upsellId ? ` · ${line.upsellId}` : ""}
                          </p>
                        </div>
                        <p
                          className={`text-base font-bold ${
                            String(line.status).toLowerCase() === "paid"
                              ? "text-[#00a581]"
                              : "text-[color:var(--a-muted)]"
                          }`}
                        >
                          {money(line.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--a-border)] bg-white/[0.02] px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--a-faint)]">
                      Total project cost (collected)
                    </span>
                    <span className="text-lg font-bold text-[#00a581]">
                      {money(g.projectTotal)}
                    </span>
                  </div>
                </div>
              ) : null}
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
