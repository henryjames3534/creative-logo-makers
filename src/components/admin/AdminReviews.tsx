"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  listReviews,
  loadCrm,
  onReviewsUpdated,
  relativeDay,
  setReviewStatus,
  type CrmReview,
  type ReviewStatus,
} from "@/lib/crm-storage";

const FILTERS: { id: ReviewStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-widest text-[#fe5f50]" aria-label={`${n} of 5`}>
      {"★".repeat(n)}
      <span className="text-white/25">{"★".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

export function AdminReviews() {
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState<Record<string, string>>({});

  useEffect(() => {
    return onReviewsUpdated(() => setTick((t) => t + 1));
  }, []);

  const reviews = useMemo(() => {
    void tick;
    return listReviews(filter);
  }, [filter, tick]);

  const pendingCount = useMemo(() => {
    void tick;
    return listReviews("pending").length;
  }, [tick]);

  function refresh() {
    setTick((t) => t + 1);
  }

  function act(id: string, status: ReviewStatus) {
    setReviewStatus(id, status, note[id]);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionTitle title="Customer reviews" />
          <p className="mt-1 text-sm text-white/50">
            Projects complete hone ke baad customers rating + review dete hain.
            Approve ke baad woh designer profile pe live ho jati hain.
          </p>
        </div>
        <Badge tone={pendingCount ? "coral" : "neutral"}>
          {pendingCount} pending
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              filter === f.id
                ? "bg-white text-[#0f1115]"
                : "border border-white/10 text-white/70 hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-white/50">
            No reviews in this filter. Complete a customer project with a rating
            from My account to see pending items here.
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              note={note[r.id] || ""}
              onNote={(v) => setNote((s) => ({ ...s, [r.id]: v }))}
              onApprove={() => act(r.id, "approved")}
              onReject={() => act(r.id, "rejected")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewRow({
  review: r,
  note,
  onNote,
  onApprove,
  onReject,
}: {
  review: CrmReview;
  note: string;
  onNote: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const crm = loadCrm();
  const project = r.projectId
    ? crm.orders.find((o) => o.id === r.projectId)
    : crm.orders.find((o) => o.serviceId === r.serviceId);

  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Stars n={r.rating} />
            <Badge
              tone={
                r.status === "approved"
                  ? "green"
                  : r.status === "rejected"
                    ? "coral"
                    : "gold"
              }
            >
              {r.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">
            {r.customerName}{" "}
            <span className="font-normal text-white/45">
              → {r.designerName}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-white/40">
            {r.customerEmail}
            {r.categoryName ? ` · ${r.categoryName}` : ""}
            {r.orderId ? ` · ${r.orderId}` : ""} · {relativeDay(r.createdAt)}
          </p>
        </div>
        <Link
          href={`/designers/${r.designerId}`}
          className="shrink-0 text-xs font-semibold text-[#5b8def] hover:underline"
          target="_blank"
        >
          View designer →
        </Link>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/80">{r.body}</p>

      {project ? (
        <p className="mt-2 text-xs text-white/40">
          Project: {project.title || project.orderId} · {project.status}
        </p>
      ) : null}

      {r.status === "pending" ? (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <input
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Optional admin note"
            className="w-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onApprove}
              className="rounded-full bg-[#00a581] px-4 py-2 text-xs font-semibold text-white hover:bg-[#008f70]"
            >
              Approve → list on website
            </button>
            <button
              type="button"
              onClick={onReject}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
            >
              Reject
            </button>
          </div>
        </div>
      ) : r.adminNote ? (
        <p className="mt-3 text-xs text-white/45">Admin note: {r.adminNote}</p>
      ) : null}
    </AdminCard>
  );
}
