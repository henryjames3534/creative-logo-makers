"use client";

import type { MouseEvent, ReactNode } from "react";

export function AdminCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = "text-[#00a581]",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <AdminCard className="p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--a-faint)]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold md:text-3xl ${accent}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-[color:var(--a-faint)]">{hint}</p> : null}
    </AdminCard>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-lg font-semibold text-[var(--a-text)]">{title}</h2>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "blue" | "coral" | "gold";
}) {
  const tones = {
    neutral: "bg-[var(--a-badge-neutral-bg)] text-[color:var(--a-badge-neutral-fg)]",
    green: "bg-[#00a581]/20 text-[color:var(--a-badge-green-fg)]",
    blue: "bg-[#2486cb]/20 text-[color:var(--a-badge-blue-fg)]",
    coral: "bg-[#fe5f50]/20 text-[color:var(--a-badge-coral-fg)]",
    gold: "bg-[#a5823d]/25 text-[color:var(--a-badge-gold-fg)]",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[color:var(--a-border)] px-4 py-10 text-center text-sm text-[color:var(--a-faint)]">
      {text}
    </p>
  );
}

export function DeleteBtn({
  onClick,
  label = "Delete",
  className = "",
}: {
  onClick: (e: MouseEvent) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[#fe5f50]/55 bg-[#fe5f50]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:bg-[#fe5f50]/25 ${className}`}
      style={{ color: "var(--a-badge-coral-fg)" }}
    >
      {label}
    </button>
  );
}
