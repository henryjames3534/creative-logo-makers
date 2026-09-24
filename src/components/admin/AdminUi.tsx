"use client";

import { ReactNode } from "react";

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#171a21] ${className}`}
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold md:text-3xl ${accent}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
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
      <h2 className="text-lg font-semibold text-white">{title}</h2>
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
    neutral: "bg-white/10 text-white/75",
    green: "bg-[#00a581]/20 text-[#5ee0bf]",
    blue: "bg-[#2486cb]/20 text-[#7ec4f0]",
    coral: "bg-[#fe5f50]/20 text-[#ff9a90]",
    gold: "bg-[#a5823d]/25 text-[#e2c589]",
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
    <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">
      {text}
    </p>
  );
}
