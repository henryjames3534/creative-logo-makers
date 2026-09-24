"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { designers } from "@/data/designers";
import {
  DEMO_PASSWORD,
  designerLogin,
  designerLogout,
  getDesignerSession,
  safeDesignerImage,
  type DesignerSession,
} from "@/lib/designer-session";

const nav = [
  { href: "/designer", label: "Dashboard", exact: true },
  { href: "/designer/projects", label: "My projects" },
  { href: "/designer/tasks", label: "My tasks" },
];

export function DesignerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<DesignerSession | null>(null);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  const quickPicks = useMemo(
    () => designers.filter((d) => ["554690", "1729434"].includes(d.id) || d.level === "top").slice(0, 6),
    [],
  );

  useEffect(() => {
    setSession(getDesignerSession());
    setReady(true);
  }, []);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    const res = designerLogin({ handleOrId: handle, password });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSession(res.session);
    setError(null);
    router.replace("/designer");
  }

  function quickLogin(id: string) {
    const res = designerLogin({ handleOrId: id, password: DEMO_PASSWORD });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSession(res.session);
    router.replace("/designer");
  }

  function onLogout() {
    designerLogout();
    setSession(null);
    router.replace("/designer");
  }

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0c1220] text-white">
        Loading designer portal…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#0c1220] px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <form
            onSubmit={onLogin}
            className="rounded-2xl border border-white/10 bg-[#141a28] p-8 shadow-2xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5b8def]">
              Designer portal
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Sign in to your work
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Assigned projects, tasks, and customer revisions land here
              automatically.
            </p>
            <label className="mt-6 block">
              <span className="text-xs font-medium text-white/50">
                Handle or designer ID
              </span>
              <input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. hadynoody"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2.5 text-sm text-white outline-none focus:border-[#5b8def]"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-white/50">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2.5 text-sm text-white outline-none focus:border-[#5b8def]"
              />
            </label>
            {error ? (
              <p className="mt-3 text-sm text-[#fe5f50]">{error}</p>
            ) : (
              <p className="mt-3 text-[11px] text-white/40">
                Demo password for all designers: {DEMO_PASSWORD}
              </p>
            )}
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-[#5b8def] py-3 text-sm font-semibold text-white hover:bg-[#4a7ad4]"
            >
              Enter portal
            </button>
            <Link
              href="/"
              className="mt-4 block text-center text-sm text-white/50 hover:text-white"
            >
              ← Back to site
            </Link>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#141a28] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
              Quick demo login
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {quickPicks.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => quickLogin(d.id)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-left hover:bg-white/5"
                >
                  <span className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10">
                    <Image
                      src={safeDesignerImage(d.avatar || d.image)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">
                      {d.name}
                    </span>
                    <span className="block truncate text-[11px] text-white/40">
                      @{d.handle}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#0c1220] text-[#e8e7e4]">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 border-r border-white/10 bg-[#141a28] p-4 transition md:static md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5b8def]">
              Designer
            </p>
            <p className="text-sm font-semibold text-white">Work hub</p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/10 px-2 py-1 text-xs md:hidden"
            onClick={() => setMobileNav(false)}
          >
            Close
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#5b8def] text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="flex items-center gap-2 px-2">
            {session.avatar ? (
              <span className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={safeDesignerImage(session.avatar)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-xs text-white">{session.name}</p>
              <p className="truncate text-[10px] text-white/40">
                @{session.handle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#141a28]/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs md:hidden"
              onClick={() => setMobileNav(true)}
            >
              Menu
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Hi, {session.name.split(" ")[0]}
              </p>
              <p className="hidden text-[11px] text-white/45 sm:block">
                Live from CRM assignments
              </p>
            </div>
          </div>
          <Link
            href={`/designers/${session.designerId}`}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
          >
            Public profile
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
