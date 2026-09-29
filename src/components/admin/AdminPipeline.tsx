"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  DEAL_STAGES,
  loadCrm,
  money,
  relativeDay,
  updateDealStage,
  upsertDeal,
  type CrmDeal,
  type CrmState,
  type DealStage,
} from "@/lib/crm-storage";

export function AdminPipeline() {
  const [state, setState] = useState<CrmState | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    value: "999",
    stage: "lead" as DealStage,
    packageName: "Gold",
    probability: "20",
  });

  useEffect(() => {
    setState(loadCrm());
  }, []);

  const byStage = useMemo(() => {
    const map: Record<DealStage, CrmDeal[]> = {
      lead: [],
      qualified: [],
      brief: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    state?.deals.forEach((d) => map[d.stage].push(d));
    return map;
  }, [state]);

  function onDrop(stage: DealStage) {
    if (!dragging) return;
    const next = updateDealStage(dragging, stage);
    setState({ ...next });
    setDragging(null);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertDeal({
      title: draft.title,
      value: Number(draft.value) || 0,
      stage: draft.stage,
      packageName: draft.packageName || undefined,
      probability: Number(draft.probability) || 20,
      ownerId: "own_admin",
    });
    setState({ ...next });
    setFormOpen(false);
    setDraft({
      title: "",
      value: "999",
      stage: "lead",
      packageName: "Gold",
      probability: "20",
    });
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">Sales pipeline</h1>
          <p className="mt-1 text-sm text-[color:var(--a-muted)]">
            Drag deals across stages — CRM updates probability and activity log.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New deal
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {DEAL_STAGES.map((stage) => {
          const deals = byStage[stage.id];
          const total = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div
              key={stage.id}
              className="w-[280px] shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(stage.id)}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <p className="text-sm font-semibold text-[var(--a-text)]">
                    {stage.label}
                  </p>
                </div>
                <p className="text-xs text-[color:var(--a-faint)]">
                  {deals.length} · {money(total)}
                </p>
              </div>
              <div className="min-h-[420px] space-y-2 rounded-2xl border border-dashed border-[color:var(--a-border)] bg-[var(--a-panel)] p-2">
                {deals.map((d) => (
                  <AdminCard
                    key={d.id}
                    className="cursor-grab p-3 active:cursor-grabbing"
                  >
                    <div
                      draggable
                      onDragStart={() => setDragging(d.id)}
                      onDragEnd={() => setDragging(null)}
                    >
                      <p className="text-sm font-semibold text-[var(--a-text)]">
                        {d.title}
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#5ee0bf]">
                        {money(d.value)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone="blue">{d.probability}%</Badge>
                        {d.packageName ? (
                          <Badge tone="gold">{d.packageName}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[11px] text-[color:var(--a-faint)]">
                        Close {relativeDay(d.closeDate)}
                      </p>
                    </div>
                  </AdminCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onSave}
            className="w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-6"
          >
            <SectionTitle title="New deal" />
            <label className="block text-xs text-[color:var(--a-muted)]">
              Title
              <input
                required
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-xs text-[color:var(--a-muted)]">
                Value
                <input
                  required
                  value={draft.value}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, value: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                />
              </label>
              <label className="block text-xs text-[color:var(--a-muted)]">
                Probability %
                <input
                  value={draft.probability}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, probability: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Stage
              <select
                value={draft.stage}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    stage: e.target.value as DealStage,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs text-[color:var(--a-muted)]">
              Package
              <input
                value={draft.packageName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, packageName: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm text-[color:var(--a-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
              >
                Save deal
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
