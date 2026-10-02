"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCard, Badge, DeleteBtn, SectionTitle } from "@/components/admin/AdminUi";
import {
  deleteOrder,
  loadCrm,
  money,
  relativeDay,
  upsertOrder,
  type CrmOrder,
  type CrmState,
} from "@/lib/crm-storage";

const STATUSES = [
  "brief_submitted",
  "designs_incoming",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const PAYMENTS = ["paid", "pending", "refunded"] as const;

export function AdminOrders() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CrmOrder | null>(null);
  const [draft, setDraft] = useState({
    customerName: "",
    customerEmail: "",
    categoryName: "Logo design",
    packageName: "Gold",
    amount: "499",
    status: "in_progress",
    paymentStatus: "paid",
    designerCount: "5",
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

  useEffect(() => {
    if (!state || !focusId) return;
    const order = state.orders.find(
      (o) => o.id === focusId || o.orderId === focusId,
    );
    if (!order) return;
    setEditing(order);
    setDraft({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      categoryName: order.categoryName,
      packageName: order.packageName,
      amount: String(order.amount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      designerCount: String(order.designerCount),
    });
    setFormOpen(true);
  }, [state, focusId]);

  const rows = useMemo(() => {
    if (!state) return [];
    return state.orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      const hay = `${o.orderId} ${o.customerName} ${o.customerEmail} ${o.categoryName}`.toLowerCase();
      return !q.trim() || hay.includes(q.trim().toLowerCase());
    });
  }, [state, q, status]);

  function openCreate() {
    setEditing(null);
    setDraft({
      customerName: "",
      customerEmail: "",
      categoryName: "Logo design",
      packageName: "Gold",
      amount: "499",
      status: "brief_submitted",
      paymentStatus: "pending",
      designerCount: "0",
    });
    setFormOpen(true);
  }

  function openEdit(o: CrmOrder) {
    setEditing(o);
    setDraft({
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      categoryName: o.categoryName,
      packageName: o.packageName,
      amount: String(o.amount),
      status: o.status,
      paymentStatus: o.paymentStatus,
      designerCount: String(o.designerCount),
    });
    setFormOpen(true);
  }

  function onSave(e: FormEvent) {
    e.preventDefault();
    const next = upsertOrder({
      id: editing?.id,
      orderId: editing?.orderId,
      customerName: draft.customerName,
      customerEmail: draft.customerEmail,
      categoryName: draft.categoryName,
      packageName: draft.packageName,
      amount: Number(draft.amount) || 0,
      status: draft.status,
      paymentStatus: draft.paymentStatus,
      designerCount: Number(draft.designerCount) || 0,
    });
    setState({ ...next });
    setFormOpen(false);
  }

  function onDelete(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!window.confirm("Delete this order/project permanently?\n\nLinked pipeline deal will also be removed.")) return;
    setState({ ...deleteOrder(id) });
    if (editing?.id === id) setFormOpen(false);
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">Orders</h1>
          <p className="mt-1 text-sm text-[color:var(--a-muted)]">
            Contests &amp; projects from the marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          + New order
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders…"
          className="min-w-0 flex-1 basis-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581] sm:min-w-[200px] sm:basis-auto"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)]"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[color:var(--a-border)] text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-[color:var(--a-border)] hover:bg-[var(--a-hover)]"
                  onClick={() => openEdit(o)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--a-text)]">{o.orderId}</p>
                    <p className="text-xs text-[color:var(--a-faint)]">{o.categoryName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[color:var(--a-muted)]">{o.customerName}</p>
                    <p className="text-xs text-[color:var(--a-faint)]">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="gold">{o.packageName}</Badge>
                    <p className="mt-1 text-[11px] text-[color:var(--a-faint)]">
                      {o.designerCount} designers
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--a-muted)]">{money(o.amount)}</td>
                  <td className="px-4 py-3 capitalize text-[color:var(--a-muted)]">
                    {o.status.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        o.paymentStatus === "paid"
                          ? "green"
                          : o.paymentStatus === "refunded"
                            ? "coral"
                            : "blue"
                      }
                    >
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--a-faint)]">
                    {relativeDay(o.updatedAt)}
                  </td>
                  <td className="sticky right-0 bg-[var(--a-surface)] px-4 py-3 shadow-[-8px_0_12px_rgba(0,0,0,0.08)]">
                    <DeleteBtn onClick={(e) => onDelete(o.id, e)} />
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
            <SectionTitle title={editing ? "Edit order" : "New order"} />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["customerName", "Customer"],
                  ["customerEmail", "Email"],
                  ["categoryName", "Category"],
                  ["packageName", "Package"],
                  ["amount", "Amount"],
                  ["designerCount", "Designers"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-[color:var(--a-muted)]">
                  {label}
                  <input
                    required={
                      key === "customerName" || key === "customerEmail"
                    }
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                  />
                </label>
              ))}
              <label className="block text-xs text-[color:var(--a-muted)]">
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, status: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-[color:var(--a-muted)]">
                Payment
                <select
                  value={draft.paymentStatus}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      paymentStatus: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)]"
                >
                  {PAYMENTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
                Save order
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
