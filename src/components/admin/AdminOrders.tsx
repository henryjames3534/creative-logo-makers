"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
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
    setState(loadCrm());
  }, []);

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

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Orders</h1>
          <p className="mt-1 text-sm text-white/50">
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
          className="min-w-0 flex-1 basis-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581] sm:min-w-[200px] sm:basis-auto"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white"
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
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                  onClick={() => openEdit(o)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{o.orderId}</p>
                    <p className="text-xs text-white/40">{o.categoryName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white/80">{o.customerName}</p>
                    <p className="text-xs text-white/40">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="gold">{o.packageName}</Badge>
                    <p className="mt-1 text-[11px] text-white/35">
                      {o.designerCount} designers
                    </p>
                  </td>
                  <td className="px-4 py-3 text-white/80">{money(o.amount)}</td>
                  <td className="px-4 py-3 capitalize text-white/70">
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
                  <td className="px-4 py-3 text-white/40">
                    {relativeDay(o.updatedAt)}
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
                <label key={key} className="block text-xs text-white/50">
                  {label}
                  <input
                    required={
                      key === "customerName" || key === "customerEmail"
                    }
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                  />
                </label>
              ))}
              <label className="block text-xs text-white/50">
                Status
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, status: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-white/50">
                Payment
                <select
                  value={draft.paymentStatus}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      paymentStatus: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white"
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
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
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
