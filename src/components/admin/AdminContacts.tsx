"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  loadCrm,
  relativeDay,
  upsertContact,
  type CrmContact,
  type CrmState,
} from "@/lib/crm-storage";

export function AdminContacts() {
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmContact | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    companyId: "",
    tags: "",
  });

  useEffect(() => {
    setState(loadCrm());
  }, []);

  const companyMap = useMemo(() => {
    const m = new Map<string, string>();
    state?.companies.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [state]);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.contacts.filter((c) => {
      const hay = `${c.name} ${c.email} ${c.title ?? ""} ${companyMap.get(c.companyId ?? "") ?? ""}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q, companyMap]);

  function openCreate() {
    setEditing(null);
    setDraft({
      name: "",
      email: "",
      phone: "",
      title: "",
      companyId: state?.companies[0]?.id ?? "",
      tags: "",
    });
    setFormOpen(true);
  }

  function openEdit(c: CrmContact) {
    setEditing(c);
    setDraft({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      title: c.title ?? "",
      companyId: c.companyId ?? "",
      tags: c.tags.join(", "),
    });
    setFormOpen(true);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertContact({
      id: editing?.id,
      name: draft.name,
      email: draft.email,
      phone: draft.phone || undefined,
      title: draft.title || undefined,
      companyId: draft.companyId || undefined,
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
          <h1 className="text-2xl font-semibold text-white">Contacts</h1>
          <p className="mt-1 text-sm text-white/50">
            People linked to companies, leads, and deals.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New contact
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search contacts…"
        className="w-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
      />

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Last touch</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                  onClick={() => openEdit(c)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-white/40">
                      {c.email}
                      {c.title ? ` · ${c.title}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {c.companyId
                      ? companyMap.get(c.companyId) || "—"
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} tone="blue">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/40">
                    {relativeDay(c.lastTouchAt)}
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
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#171a21] p-6"
          >
            <SectionTitle
              title={editing ? "Edit contact" : "New contact"}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["title", "Title"],
                  ["tags", "Tags (comma)"],
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
                Company
                <select
                  value={draft.companyId}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, companyId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  <option value="">No company</option>
                  {state.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
                Save contact
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
