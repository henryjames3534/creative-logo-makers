"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, DeleteBtn, SectionTitle } from "@/components/admin/AdminUi";
import {
  LEAD_STATUSES,
  deleteLead,
  loadCrm,
  money,
  relativeDay,
  upsertLead,
  type CrmLead,
  type CrmState,
  type LeadStatus,
} from "@/lib/crm-storage";

export function AdminLeads() {
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    source: "Manual",
    interest: "Logo design",
    valueEstimate: "499",
    notes: "",
    status: "new" as LeadStatus,
    score: "60",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { hydrateCrmFromServer } = await import("@/lib/crm-storage");
        await hydrateCrmFromServer();
      } catch {
        /* ignore */
      }
      if (!cancelled) setState(loadCrm());
    })();
    const poll = window.setInterval(() => {
      void import("@/lib/crm-storage")
        .then(({ hydrateCrmFromServer }) => hydrateCrmFromServer())
        .then(() => {
          if (!cancelled) setState(loadCrm());
        })
        .catch(() => null);
    }, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      const hay = `${l.name} ${l.email} ${l.company ?? ""} ${l.interest}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q, status]);

  function openCreate() {
    setEditing(null);
    setDraft({
      name: "",
      email: "",
      company: "",
      phone: "",
      source: "Manual",
      interest: "Logo design",
      valueEstimate: "499",
      notes: "",
      status: "new",
      score: "60",
    });
    setFormOpen(true);
  }

  function openEdit(l: CrmLead) {
    setEditing(l);
    setDraft({
      name: l.name,
      email: l.email,
      company: l.company ?? "",
      phone: l.phone ?? "",
      source: l.source,
      interest: l.interest,
      valueEstimate: String(l.valueEstimate),
      notes: l.notes,
      status: l.status,
      score: String(l.score),
    });
    setFormOpen(true);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertLead({
      id: editing?.id,
      name: draft.name,
      email: draft.email,
      company: draft.company || undefined,
      phone: draft.phone || undefined,
      source: draft.source,
      interest: draft.interest,
      valueEstimate: Number(draft.valueEstimate) || 0,
      notes: draft.notes,
      status: draft.status,
      score: Number(draft.score) || 0,
      ownerId: editing?.ownerId || "own_admin",
    });
    setState({ ...next });
    setFormOpen(false);
  }

  function onDelete(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!window.confirm("Delete this lead permanently?")) return;
    setState({ ...deleteLead(id) });
    if (editing?.id === id) setFormOpen(false);
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">Leads</h1>
          <p className="mt-1 text-sm text-[color:var(--a-muted)]">
            Capture, score, and progress inbound demand.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New lead
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads…"
          className="min-w-0 flex-1 basis-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581] sm:min-w-[200px] sm:basis-auto"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}
          className="rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)]"
        >
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[color:var(--a-border)] text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer border-b border-[color:var(--a-border)] hover:bg-[var(--a-hover)]"
                  onClick={() => openEdit(l)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--a-text)]">{l.name}</p>
                    <p className="text-xs text-[color:var(--a-faint)]">
                      {l.email}
                      {l.company ? ` · ${l.company}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--a-muted)]">{l.interest}</td>
                  <td className="px-4 py-3">
                    <Badge tone={l.score >= 80 ? "green" : "blue"}>
                      {l.score}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--a-muted)]">
                    {money(l.valueEstimate)}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--a-muted)]">{l.status}</td>
                  <td className="px-4 py-3 text-[color:var(--a-faint)]">
                    {relativeDay(l.updatedAt)}
                  </td>
                  <td className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 shadow-[-8px_0_12px_rgba(0,0,0,0.08)]">
                    <DeleteBtn onClick={(e) => onDelete(l.id, e)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {formOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onSave}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-6"
          >
            <SectionTitle title={editing ? "Edit lead" : "New lead"} />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Name"],
                  ["email", "Email"],
                  ["company", "Company"],
                  ["phone", "Phone"],
                  ["source", "Source"],
                  ["interest", "Interest"],
                  ["valueEstimate", "Value"],
                  ["score", "Score"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-[color:var(--a-muted)]">
                  {label}
                  <input
                    required={key === "name" || key === "email"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                  />
                </label>
              ))}
              <label className="block text-xs text-[color:var(--a-muted)] sm:col-span-2">
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: e.target.value as LeadStatus,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[color:var(--a-muted)] sm:col-span-2">
                Notes
                <textarea
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                />
              </label>
            </div>
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
                Save lead
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
