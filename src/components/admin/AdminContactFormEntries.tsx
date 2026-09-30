"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminCard, Badge, DeleteBtn } from "@/components/admin/AdminUi";
import {
  deleteLead,
  hydrateCrmFromServer,
  isContactFormLead,
  loadCrm,
  relativeDay,
  type CrmLead,
  type CrmState,
} from "@/lib/crm-storage";

function parseNotes(notes: string) {
  const lines = (notes || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const pageLine = lines.find((l) => l.toLowerCase().startsWith("page:"));
  const message = lines
    .filter((l) => l !== pageLine)
    .join("\n")
    .trim();
  const page = pageLine ? pageLine.replace(/^page:\s*/i, "") : "";
  return { message, page };
}

export function AdminContactFormEntries() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await hydrateCrmFromServer();
      } catch {
        /* ignore */
      }
      if (!cancelled) setState(loadCrm());
    })();
    const poll = window.setInterval(() => {
      void hydrateCrmFromServer()
        .then(() => {
          if (!cancelled) setState(loadCrm());
        })
        .catch(() => null);
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (focusId) setSelectedId(focusId);
  }, [focusId]);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.leads
      .filter(isContactFormLead)
      .filter((l) => {
        const hay = `${l.name} ${l.email} ${l.interest} ${l.notes}`.toLowerCase();
        return !q.trim() || hay.includes(q.trim().toLowerCase());
      })
      .sort(
        (a, b) =>
          +new Date(b.createdAt || b.updatedAt) -
          +new Date(a.createdAt || a.updatedAt),
      );
  }, [state, q]);

  const selected: CrmLead | null = useMemo(() => {
    if (!selectedId || !state) return null;
    return state.leads.find((l) => l.id === selectedId) || null;
  }, [state, selectedId]);

  function onDelete(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!window.confirm("Delete this contact form entry?")) return;
    setState({ ...deleteLead(id) });
    if (selectedId === id) setSelectedId(null);
  }

  if (!state) {
    return <p className="text-[color:var(--a-muted)]">Loading…</p>;
  }

  const selectedNotes = selected ? parseNotes(selected.notes) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">
            Contact form entries
          </h1>
          <p className="mt-1 text-sm text-[color:var(--a-muted)]">
            Website /contact submissions only — separate from pipeline leads.
          </p>
        </div>
        <Badge tone="blue">{rows.length} entries</Badge>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, topic, message…"
        className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[color:var(--a-border)] text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                <tr>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-[color:var(--a-faint)]"
                    >
                      No contact form entries yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((l) => {
                    const active = selectedId === l.id;
                    const preview = parseNotes(l.notes).message;
                    return (
                      <tr
                        key={l.id}
                        className={`cursor-pointer border-b border-[color:var(--a-border)] hover:bg-[var(--a-hover)] ${
                          active ? "bg-[var(--a-hover)]" : ""
                        }`}
                        onClick={() => setSelectedId(l.id)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--a-text)]">
                            {l.name}
                          </p>
                          <p className="text-xs text-[color:var(--a-faint)]">
                            {l.email}
                          </p>
                          {preview ? (
                            <p className="mt-1 line-clamp-1 text-[11px] text-[color:var(--a-muted)]">
                              {preview}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--a-muted)]">
                          {l.interest || "—"}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--a-faint)]">
                          {relativeDay(l.createdAt)}
                        </td>
                        <td className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 shadow-[-8px_0_12px_rgba(0,0,0,0.08)]">
                          <DeleteBtn onClick={(e) => onDelete(l.id, e)} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          {!selected || !selectedNotes ? (
            <p className="text-sm text-[color:var(--a-faint)]">
              Select an entry to see full contact form details.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--a-faint)]">
                  Contact form entry
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--a-text)]">
                  {selected.name}
                </h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-[#5ee0bf] hover:underline"
                >
                  {selected.email}
                </a>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 border-b border-[color:var(--a-border)] py-2">
                  <dt className="text-[color:var(--a-faint)]">Topic</dt>
                  <dd className="text-right text-[var(--a-text)]">
                    {selected.interest || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[color:var(--a-border)] py-2">
                  <dt className="text-[color:var(--a-faint)]">Page</dt>
                  <dd className="text-right text-[var(--a-text)]">
                    {selectedNotes.page || "/contact"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[color:var(--a-border)] py-2">
                  <dt className="text-[color:var(--a-faint)]">Submitted</dt>
                  <dd className="text-right text-[var(--a-text)]">
                    {relativeDay(selected.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[color:var(--a-border)] py-2">
                  <dt className="text-[color:var(--a-faint)]">Status</dt>
                  <dd className="text-right">
                    <Badge tone="neutral">{selected.status}</Badge>
                  </dd>
                </div>
              </dl>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--a-faint)]">
                  Message
                </p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-3 font-sans text-sm text-[color:var(--a-muted)]">
                  {selectedNotes.message || "(no message)"}
                </pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.interest || "your message")}`}
                  className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
                >
                  Reply by email
                </a>
                <Link
                  href={`/admin/notifications/lead/${encodeURIComponent(selected.id)}`}
                  className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                >
                  Full detail
                </Link>
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
