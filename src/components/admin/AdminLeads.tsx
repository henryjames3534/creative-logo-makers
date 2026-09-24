"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  LEAD_STATUSES,
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
    setState(loadCrm());
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

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="mt-1 text-sm text-white/50">
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
          className="min-w-0 flex-1 basis-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581] sm:min-w-[200px] sm:basis-auto"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}
          className="rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white"
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
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                  onClick={() => openEdit(l)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{l.name}</p>
                    <p className="text-xs text-white/40">
                      {l.email}
                      {l.company ? ` · ${l.company}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{l.interest}</td>
                  <td className="px-4 py-3">
                    <Badge tone={l.score >= 80 ? "green" : "blue"}>
                      {l.score}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    {money(l.valueEstimate)}
                  </td>
                  <td className="px-4 py-3 capitalize text-white/70">
                    {l.status}
                  </td>
                  <td className="px-4 py-3 text-white/40">
                    {relativeDay(l.updatedAt)}
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#171a21] p-6"
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
                <label key={key} className="block text-xs text-white/50">
                  {label}
                  <input
                    required={key === "name" || key === "email"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                  />
                </label>
              ))}
              <label className="block text-xs text-white/50 sm:col-span-2">
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: e.target.value as LeadStatus,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-white/50 sm:col-span-2">
                Notes
                <textarea
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
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
                Save lead
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
