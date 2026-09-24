"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  loadCrm,
  relativeDay,
  upsertCompany,
  type CrmCompany,
  type CrmState,
} from "@/lib/crm-storage";

export function AdminCompanies() {
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmCompany | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    industry: "",
    website: "",
    size: "1-10",
    country: "United States",
    notes: "",
  });

  useEffect(() => {
    setState(loadCrm());
  }, []);

  const contactCounts = useMemo(() => {
    const m = new Map<string, number>();
    state?.contacts.forEach((c) => {
      if (!c.companyId) return;
      m.set(c.companyId, (m.get(c.companyId) || 0) + 1);
    });
    return m;
  }, [state]);

  const dealCounts = useMemo(() => {
    const m = new Map<string, number>();
    state?.deals.forEach((d) => {
      if (!d.companyId) return;
      m.set(d.companyId, (m.get(d.companyId) || 0) + 1);
    });
    return m;
  }, [state]);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.companies.filter((c) => {
      const hay = `${c.name} ${c.industry} ${c.country}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q]);

  function openCreate() {
    setEditing(null);
    setDraft({
      name: "",
      industry: "Technology",
      website: "",
      size: "1-10",
      country: "United States",
      notes: "",
    });
    setFormOpen(true);
  }

  function openEdit(c: CrmCompany) {
    setEditing(c);
    setDraft({
      name: c.name,
      industry: c.industry,
      website: c.website ?? "",
      size: c.size,
      country: c.country,
      notes: c.notes ?? "",
    });
    setFormOpen(true);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertCompany({
      id: editing?.id,
      name: draft.name,
      industry: draft.industry,
      website: draft.website || undefined,
      size: draft.size,
      country: draft.country,
      notes: draft.notes || undefined,
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
          <h1 className="text-2xl font-semibold text-white">Companies</h1>
          <p className="mt-1 text-sm text-white/50">
            Accounts with contacts, deals, and notes.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New company
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search companies…"
        className="w-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <AdminCard
            key={c.id}
            className="cursor-pointer p-4 transition hover:border-[#00a581]/40"
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => openEdit(c)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="mt-0.5 text-xs text-white/45">
                    {c.industry} · {c.country}
                  </p>
                </div>
                <Badge tone="neutral">{c.size}</Badge>
              </div>
              <div className="mt-3 flex gap-2 text-xs text-white/50">
                <span>{contactCounts.get(c.id) || 0} contacts</span>
                <span>·</span>
                <span>{dealCounts.get(c.id) || 0} deals</span>
                <span>·</span>
                <span>{relativeDay(c.createdAt)}</span>
              </div>
              {c.website ? (
                <p className="mt-2 truncate text-xs text-[#7ec4f0]">
                  {c.website}
                </p>
              ) : null}
            </button>
          </AdminCard>
        ))}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={onSave}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle
              title={editing ? "Edit company" : "New company"}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Name"],
                  ["industry", "Industry"],
                  ["website", "Website"],
                  ["size", "Size"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-white/50">
                  {label}
                  <input
                    required={key === "name"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                  />
                </label>
              ))}
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
                Save company
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
