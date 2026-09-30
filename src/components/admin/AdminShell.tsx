"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AdminNotificationBar } from "@/components/admin/AdminNotificationBar";
import {
  adminLogin,
  adminLogout,
  getAdminSession,
  hydrateCrmFromServer,
  rememberStaffEmail,
} from "@/lib/crm-storage";
import {
  hydrateChatFromServer,
  onLiveChatOpened,
  onLiveChatUpdated,
  unreadChatCount,
  type LiveChatSession,
} from "@/lib/live-chat";

const THEME_KEY = "clm_admin_theme";
type AdminTheme = "dark" | "light";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/live-chat", label: "Live chat" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/support", label: "Support inbox" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contact-form-entries", label: "Contact form entries" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/designers", label: "Designers" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/settings", label: "Settings" },
];

function readTheme(): AdminTheme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [theme, setTheme] = useState<AdminTheme>("dark");
  const [chatToast, setChatToast] = useState<LiveChatSession | null>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([
        hydrateCrmFromServer().catch(() => null),
        hydrateChatFromServer().catch(() => null),
      ]);
      if (cancelled) return;
      const sess = getAdminSession();
      if (sess?.email) rememberStaffEmail(sess.email);
      setSession(sess);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const refreshUnread = () => setChatUnread(unreadChatCount());
    refreshUnread();
    const offUpdate = onLiveChatUpdated(refreshUnread);
    const offOpen = onLiveChatOpened((s) => {
      setChatUnread(unreadChatCount());
      setChatToast(s);
      try {
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification("New live chat", {
            body: `Visitor opened chat on ${s.path || "/"}`,
          });
        } else if (
          typeof Notification !== "undefined" &&
          Notification.permission === "default"
        ) {
          Notification.requestPermission();
        }
      } catch {
        /* ignore */
      }
    });
    return () => {
      offUpdate();
      offOpen();
    };
  }, [session]);

  useEffect(() => {
    if (!chatToast) return;
    const t = window.setTimeout(() => setChatToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [chatToast]);

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = adminLogin(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSession(getAdminSession());
    setError(null);
    router.replace("/admin");
  }

  function onLogout() {
    adminLogout();
    setSession(null);
    router.replace("/admin");
  }

  function toggleTheme() {
    setTheme((prev) => {
      const next: AdminTheme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  if (!ready) {
    return (
      <div
        className="admin-root fixed inset-0 z-[200] flex items-center justify-center bg-[var(--a-bg)] text-[var(--a-text)]"
        data-admin-theme={theme}
      >
        Loading admin…
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="admin-root fixed inset-0 z-[200] flex items-center justify-center bg-[var(--a-bg)] px-4"
        data-admin-theme={theme}
      >
        <form
          onSubmit={onLogin}
          className="relative w-full max-w-md rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)] p-8 shadow-2xl"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="absolute right-4 top-4 rounded-full border border-[color:var(--a-border)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
            aria-label="Toggle light/dark mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00a581]">
            Creative Logo Makers Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--a-text)]">
            CRM sign in
          </h1>
          <p className="mt-2 text-sm text-[color:var(--a-muted)]">
            Advanced CRM for leads, pipeline, orders, and designers.
          </p>
          <label className="mt-6 block">
            <span className="text-xs font-medium text-[color:var(--a-muted)]">Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2.5 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-[color:var(--a-muted)]">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2.5 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
            />
          </label>
          {error ? (
            <p className="mt-3 text-sm text-[#fe5f50]">{error}</p>
          ) : null}
          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[#00a581] py-3 text-sm font-semibold text-white hover:bg-[#008f70]"
          >
            Enter CRM
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-[color:var(--a-muted)] hover:text-[var(--a-text)]"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div
      className="admin-root fixed inset-0 z-[200] flex bg-[var(--a-bg)] text-[var(--a-text)]"
      data-admin-theme={theme}
    >
      {/* Mobile dim backdrop */}
      {mobileNav ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-black/55 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-[min(18rem,88vw)] flex-col border-r border-[color:var(--a-border)] bg-[var(--a-panel)] transition md:static md:w-64 md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--a-border)] px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00a581]">
              Admin CRM
            </p>
            <p className="truncate text-sm font-semibold text-[var(--a-text)]">
              Creative Logo Makers Ops
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[color:var(--a-border)] px-2 py-1 text-xs md:hidden"
            onClick={() => setMobileNav(false)}
          >
            Close
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const isChat = item.href === "/admin/live-chat";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#00a581] text-white"
                    : "text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] hover:text-[var(--a-text)]"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {isChat && chatUnread > 0 ? (
                  <span className="shrink-0 rounded-full bg-[#fe5f50] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {chatUnread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-[color:var(--a-border)] bg-[var(--a-panel)] p-4">
          <p className="truncate px-1 text-xs text-[color:var(--a-faint)]" title={session.email}>
            {session.email}
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-[color:var(--a-border)] px-3 py-2 text-sm text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="relative z-[60] flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[color:var(--a-border)] bg-[var(--a-panel)] px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="shrink-0 rounded-lg border border-[color:var(--a-border)] px-2.5 py-1.5 text-xs md:hidden"
              onClick={() => setMobileNav(true)}
            >
              Menu
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--a-text)]">
                {session.name}
              </p>
              <p className="hidden text-[11px] text-[color:var(--a-faint)] sm:block">
                Live CRM · synced
              </p>
            </div>
          </div>
          <div className="flex max-w-full min-w-0 flex-1 items-center justify-end gap-2 overflow-visible pb-0.5 sm:flex-none">
            <button
              type="button"
              onClick={toggleTheme}
              className="shrink-0 rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] hover:text-[var(--a-text)]"
              aria-label="Toggle light/dark mode"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <AdminNotificationBar />
            <Link
              href="/admin/live-chat"
              className="relative shrink-0 rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
            >
              Live chat
              {chatUnread > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fe5f50] px-1 text-[10px] font-bold text-white">
                  {chatUnread}
                </span>
              ) : null}
            </Link>
            <Link
              href="/designer"
              className="hidden shrink-0 rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] sm:inline-flex"
            >
              Designer portal
            </Link>
            <Link
              href="/"
              className="hidden shrink-0 rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] md:inline-flex"
            >
              View site
            </Link>
            <Link
              href="/get-started"
              className="shrink-0 rounded-full bg-[#00a581] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#008f70]"
            >
              New brief
            </Link>
          </div>
        </header>
        <main className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--a-bg)] p-4 md:p-6">
          {children}
        </main>
      </div>

      {chatToast ? (
        <div className="fixed bottom-6 right-6 z-[220] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[#fe5f50]/40 bg-[#1a1010] p-4 shadow-2xl">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#fe5f50]">
            New live chat
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--a-text)]">
            Visitor opened chat
          </p>
          <p className="mt-1 text-xs text-[color:var(--a-muted)]">
            Page: {chatToast.path || "/"} · bot started asking questions
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/admin/live-chat"
              onClick={() => setChatToast(null)}
              className="rounded-full bg-[#fe5f50] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Open live chat
            </Link>
            <button
              type="button"
              onClick={() => setChatToast(null)}
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
