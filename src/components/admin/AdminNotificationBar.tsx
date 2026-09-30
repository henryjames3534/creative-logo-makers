"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CRM_CHANGED_EVENT,
  CRM_HYDRATED_EVENT,
  hydrateCrmFromServer,
  loadCrm,
  relativeDay,
  type CrmActivity,
  type CrmState,
  isWebsiteVisitor,
} from "@/lib/crm-storage";

const READ_KEY = "clm_admin_notif_read_at";

type NotifItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
  tone: "green" | "blue" | "coral" | "violet" | "amber";
};

function detailHref(
  kind: "activity" | "lead" | "visitor" | "order" | "contact" | "deal" | "company",
  id: string,
) {
  return `/admin/notifications/${kind}/${encodeURIComponent(id)}`;
}

function readAt(): number {
  try {
    return Number(sessionStorage.getItem(READ_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function markRead(ts: number) {
  try {
    sessionStorage.setItem(READ_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

function hrefFor(a: CrmActivity): string {
  if (a.relatedType === "lead" && a.relatedId) {
    return detailHref("lead", a.relatedId);
  }
  if (
    (a.relatedType === "order" || a.relatedType === "project") &&
    a.relatedId
  ) {
    return detailHref("order", a.relatedId);
  }
  if (a.relatedType === "contact" && a.relatedId) {
    return detailHref("contact", a.relatedId);
  }
  if (a.relatedType === "deal" && a.relatedId) {
    return detailHref("deal", a.relatedId);
  }
  if (a.relatedType === "company" && a.relatedId) {
    return detailHref("company", a.relatedId);
  }
  const t = (a.title || "").toLowerCase();
  if (t.includes("visitor") && a.relatedId) {
    return detailHref("visitor", a.relatedId);
  }
  if (t.includes("visitor")) return "/admin/visitors";
  return detailHref("activity", a.id);
}

function toneFor(a: CrmActivity): NotifItem["tone"] {
  const t = `${a.type} ${a.title}`.toLowerCase();
  if (t.includes("payment")) return "green";
  if (t.includes("visitor")) return "blue";
  if (t.includes("lead") || t.includes("form")) return "violet";
  if (t.includes("project") || t.includes("order")) return "amber";
  if (t.includes("delete")) return "coral";
  return "blue";
}

function buildFeed(state: CrmState): NotifItem[] {
  const fromActivities: NotifItem[] = (state.activities || [])
    .slice(0, 40)
    .map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      createdAt: a.createdAt,
      href: hrefFor(a),
      tone: toneFor(a),
    }));

  // Also surface very recent visitors / leads / paid orders if activity log lagged
  const extras: NotifItem[] = [];
  for (const v of (state.visitors || []).filter(isWebsiteVisitor).slice(0, 8)) {
    extras.push({
      id: `vis-${v.id}-${v.lastSeenAt}`,
      title: "Visitor activity",
      body: `${v.email || v.name || "Anonymous"} · ${v.geo?.ip || "no IP"} · ${v.path || "/"}`,
      createdAt: v.lastSeenAt,
      href: detailHref("visitor", v.id),
      tone: "blue",
    });
  }
  for (const l of (state.leads || []).slice(0, 8)) {
    extras.push({
      id: `ld-${l.id}-${l.updatedAt}`,
      title: "Lead",
      body: `${l.name} <${l.email}> · ${l.source} · ${l.interest}`,
      createdAt: l.updatedAt || l.createdAt,
      href: detailHref("lead", l.id),
      tone: "violet",
    });
  }
  for (const o of (state.orders || []).slice(0, 8)) {
    extras.push({
      id: `or-${o.id}-${o.updatedAt}`,
      title: o.paymentStatus === "paid" ? "Payment / project" : "Project",
      body: `${o.orderId} · ${o.customerName} · ${o.packageName} · $${o.amount}`,
      createdAt: o.updatedAt || o.createdAt,
      href: detailHref("order", o.id),
      tone: o.paymentStatus === "paid" ? "green" : "amber",
    });
  }

  const map = new Map<string, NotifItem>();
  for (const n of [...fromActivities, ...extras]) {
    if (!map.has(n.id)) map.set(n.id, n);
  }
  return [...map.values()]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 30);
}

const TONE: Record<NotifItem["tone"], string> = {
  green: "bg-[#00a581]/20 text-[color:var(--a-badge-green-fg)]",
  blue: "bg-[#2486cb]/20 text-[color:var(--a-badge-blue-fg)]",
  coral: "bg-[#fe5f50]/20 text-[color:var(--a-badge-coral-fg)]",
  violet: "bg-[#834692]/25 text-[color:var(--a-badge-violet-fg)]",
  amber: "bg-[#a5823d]/25 text-[color:var(--a-badge-amber-fg)]",
};

export function AdminNotificationBar() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [seenAt, setSeenAt] = useState(0);
  const [toast, setToast] = useState<NotifItem | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 56, right: 16 });
  const known = useRef<Set<string>>(new Set());
  const bootstrapped = useRef(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  function placePanel() {
    const el = btnRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const width = Math.min(384, window.innerWidth - 16);
    const right = Math.max(8, window.innerWidth - r.right);
    const top = Math.min(r.bottom + 8, window.innerHeight - 120);
    setPanelPos({ top, right: Math.min(right, window.innerWidth - width - 8) });
  }

  function refresh() {
    const feed = buildFeed(loadCrm());
    setItems(feed);

    if (!bootstrapped.current) {
      bootstrapped.current = true;
      known.current = new Set(feed.map((n) => n.id));
      return;
    }

    const fresh = feed.filter((n) => !known.current.has(n.id));
    if (fresh.length) {
      for (const n of fresh) known.current.add(n.id);
      setToast(fresh[0]);
      try {
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(fresh[0].title, { body: fresh[0].body });
        }
      } catch {
        /* ignore */
      }
    }
  }

  useEffect(() => {
    setSeenAt(readAt());
    refresh();
    const onChange = () => refresh();
    window.addEventListener(CRM_CHANGED_EVENT, onChange);
    window.addEventListener(CRM_HYDRATED_EVENT, onChange);
    const poll = window.setInterval(() => {
      void hydrateCrmFromServer()
        .then(() => refresh())
        .catch(() => null);
    }, 10000);
    return () => {
      window.removeEventListener(CRM_CHANGED_EVENT, onChange);
      window.removeEventListener(CRM_HYDRATED_EVENT, onChange);
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const unread = useMemo(() => {
    if (!seenAt) return items.slice(0, 12).length;
    return items.filter((n) => +new Date(n.createdAt) > seenAt).length;
  }, [items, seenAt]);

  function openPanel() {
    setOpen((v) => {
      if (v) {
        const now = Date.now();
        markRead(now);
        setSeenAt(now);
        return false;
      }
      placePanel();
      return true;
    });
    setToast(null);
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
  }

  function closePanel() {
    const now = Date.now();
    markRead(now);
    setSeenAt(now);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    placePanel();
    const onWin = () => placePanel();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open]);

  return (
    <div className="relative z-[50] shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={openPanel}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
          unread > 0
            ? "border-[#fe5f50]/35 bg-[#fe5f50]/10 text-white"
            : "border-[color:var(--a-border)] text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] hover:text-[var(--a-text)]"
        }`}
        aria-label={
          unread > 0
            ? `${unread} unread notifications`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#fe5f50] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-[var(--a-panel)]">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[9998] cursor-default bg-black/20"
            aria-label="Close notifications"
            onClick={closePanel}
          />
          <div
            className="fixed z-[9999] w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-[color:var(--a-border-strong)] bg-[var(--a-surface)] shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
            style={{ top: panelPos.top, right: panelPos.right }}
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--a-border)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--a-text)]">Notifications</p>
                <p className="text-[11px] text-[color:var(--a-faint)]">
                  {unread > 0
                    ? `${unread} unread`
                    : items.length
                      ? "All caught up"
                      : "No activity yet"}
                </p>
              </div>
              <Link
                href="/admin/activity"
                onClick={closePanel}
                className="text-[11px] text-[#5ee0bf] hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="max-h-[min(28rem,70vh)] overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-[color:var(--a-faint)]">
                  No notifications yet
                </li>
              ) : (
                items.map((n) => {
                  const isUnread = !seenAt || +new Date(n.createdAt) > seenAt;
                  return (
                    <li key={n.id} className="border-b border-[color:var(--a-border)]">
                      <Link
                        href={n.href}
                        onClick={closePanel}
                        className={`block px-4 py-3 hover:bg-[var(--a-hover)] ${
                          isUnread ? "bg-[var(--a-hover)]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {isUnread ? (
                              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#fe5f50]" />
                            ) : null}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE[n.tone]}`}
                            >
                              {n.title}
                            </span>
                          </div>
                          <span className="shrink-0 text-[10px] text-[color:var(--a-faint)]">
                            {relativeDay(n.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 line-clamp-2 text-xs ${
                            isUnread
                              ? "font-medium text-[color:var(--a-muted)]"
                              : "text-[color:var(--a-muted)]"
                          }`}
                        >
                          {n.body}
                        </p>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      ) : null}

      {toast && !open ? (
        <div className="fixed bottom-6 right-6 z-[9999] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[color:var(--a-border-strong)] bg-[var(--a-elevated)] p-4 shadow-2xl">
          <p className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TONE[toast.tone]}`}>
            {toast.title}
          </p>
          <p className="mt-2 text-sm text-[color:var(--a-muted)]">{toast.body}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href={toast.href}
              onClick={() => setToast(null)}
              className="rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Open
            </Link>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-full border border-[color:var(--a-border-strong)] px-3 py-1.5 text-xs text-[color:var(--a-muted)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
