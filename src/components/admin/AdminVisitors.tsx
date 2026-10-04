"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCard, Badge, DeleteBtn } from "@/components/admin/AdminUi";
import {
  deleteVisitor,
  deleteVisitors,
  formatDuration,
  hydrateCrmFromServer,
  isWebsiteVisitor,
  loadCrm,
  onCrmHydrated,
  onVisitorTracked,
  relativeDay,
  rememberStaffEmail,
  type CrmState,
  type CrmVisitor,
} from "@/lib/crm-storage";

function locLine(v: CrmVisitor) {
  return [v.geo?.city, v.geo?.region, v.geo?.country || v.geo?.countryCode]
    .filter(Boolean)
    .join(", ");
}

function latLong(v: CrmVisitor) {
  const lat = v.geo?.latitude;
  const lng = v.geo?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function AdminVisitors() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function reload(msg?: string) {
    setState(loadCrm());
    if (msg) setHint(msg);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await hydrateCrmFromServer();
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      rememberStaffEmail("admin@creativelogomakers.com");
      // Exclude admin IP + purge junk
      try {
        await fetch("/api/visitors/exclude-staff", { method: "POST" });
        await hydrateCrmFromServer();
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      // Only display-filter in the UI — do not auto-delete older rows
      // (that was wiping historical visitors that failed strict checks).
      setState(loadCrm());
    })();

    const offHydrated = onCrmHydrated((s) => setState(s));
    const offTracked = onVisitorTracked(() => setState(loadCrm()));
    const poll = window.setInterval(() => {
      void hydrateCrmFromServer().catch(() => null);
    }, 15000);

    return () => {
      cancelled = true;
      offHydrated();
      offTracked();
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!focusId) return;
    setSelectedId(focusId);
  }, [focusId]);

  const rows = useMemo(() => {
    if (!state?.visitors) return [];
    return [...state.visitors]
      // Prefer public website visitors; still keep older IP rows that
      // fail stricter path checks so history stays visible.
      .filter((v) => {
        if (isWebsiteVisitor(v)) return true;
        const ip = (v.geo?.ip || "").trim().toLowerCase();
        if (!ip) return false;
        if (
          ip === "::1" ||
          ip === "127.0.0.1" ||
          ip === "localhost" ||
          ip.startsWith("10.") ||
          ip.startsWith("192.168.") ||
          ip.startsWith("fc") ||
          ip.startsWith("fd") ||
          ip.startsWith("fe80:")
        ) {
          return false;
        }
        return true;
      })
      .filter((v) => {
        const hay =
          `${v.geo?.ip ?? ""} ${v.geo?.city ?? ""} ${v.geo?.country ?? ""} ${v.geo?.countryCode ?? ""} ${v.path ?? ""} ${v.geo?.isp ?? ""} ${v.name ?? ""} ${v.email ?? ""}`.toLowerCase();
        return !q.trim() || hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => +new Date(b.lastSeenAt) - +new Date(a.lastSeenAt));
  }, [state, q]);

  const storedCount = state?.visitors?.length || 0;

  const allChecked = rows.length > 0 && rows.every((v) => checked.has(v.id));
  const checkedCount = rows.filter((v) => checked.has(v.id)).length;

  const selected: CrmVisitor | null = useMemo(() => {
    if (!state || !selectedId) return null;
    return state.visitors.find((v) => v.id === selectedId) || null;
  }, [state, selectedId]);

  function onDeleteVisitor(v: CrmVisitor) {
    if (
      !window.confirm(
        `Delete visitor ${v.geo?.ip || v.name || v.id}?`,
      )
    ) {
      return;
    }
    deleteVisitor(v.id);
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(v.id);
      return next;
    });
    if (selectedId === v.id) setSelectedId(null);
    reload("Visitor deleted");
  }

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCheckAll() {
    if (allChecked) {
      setChecked(new Set());
      return;
    }
    setChecked(new Set(rows.map((v) => v.id)));
  }

  function onBulkDelete() {
    const ids = rows.filter((v) => checked.has(v.id)).map((v) => v.id);
    if (!ids.length) return;
    if (
      !window.confirm(
        `Delete ${ids.length} selected visitor${ids.length > 1 ? "s" : ""}?`,
      )
    ) {
      return;
    }
    deleteVisitors(ids);
    setChecked(new Set());
    if (selectedId && ids.includes(selectedId)) setSelectedId(null);
    reload(`${ids.length} visitors deleted`);
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">
            Website visitors
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[color:var(--a-muted)]">
            Har public visit ka IP, country, lat/long, visits aur time-on-site.
            Admin login IP yahan nahi aati. Emails Leads/Contacts mein alag
            capture hoti hain — yeh list sirf traffic hai.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void hydrateCrmFromServer().then(() =>
              reload("Synced from server"),
            );
          }}
          className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
        >
          Sync now
        </button>
      </div>

      {hint ? (
        <p className="rounded-xl border border-[#00a581]/30 bg-[#00a581]/10 px-3 py-2 text-xs text-[#5ee0bf]">
          {hint}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
            Unique visitors
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--a-text)]">
            {rows.length}
          </p>
          {storedCount > rows.length ? (
            <p className="mt-1 text-[11px] text-[color:var(--a-faint)]">
              {storedCount} stored · {storedCount - rows.length} hidden
              (private/staff)
            </p>
          ) : null}
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
            Total visits
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--a-text)]">
            {rows.reduce((n, v) => n + (v.visitCount || 0), 0)}
          </p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
            With geo / IP
          </p>
          <p className="mt-1 text-2xl font-semibold text-[var(--a-text)]">
            {rows.filter((v) => v.geo?.ip && v.geo?.country).length}
          </p>
        </AdminCard>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search IP, city, country, path…"
        className="w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-surface)] px-3 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--a-muted)]">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleCheckAll}
            className="h-4 w-4 rounded border-[color:var(--a-border)] accent-[#00a581]"
          />
          Select all ({rows.length})
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[color:var(--a-faint)]">
            {checkedCount} selected
          </span>
          <DeleteBtn
            label={
              checkedCount
                ? `Delete selected (${checkedCount})`
                : "Delete selected"
            }
            className={checkedCount ? "" : "pointer-events-none opacity-40"}
            onClick={() => {
              if (!checkedCount) return;
              onBulkDelete();
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr] xl:items-start">
        <div className="flex max-h-[min(70vh,calc(100dvh-14rem))] flex-col overflow-hidden rounded-2xl border border-[color:var(--a-border)] bg-[var(--a-surface)]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--a-border)] px-3 py-2">
            <p className="text-xs font-medium text-[color:var(--a-muted)]">
              Visitor list · scroll for older rows
            </p>
            <p className="text-[11px] text-[color:var(--a-faint)]">
              {rows.length} shown
            </p>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2">
          {rows.length === 0 ? (
            <AdminCard className="p-8 text-center text-sm text-[color:var(--a-faint)]">
              Abhi koi public visitor nahi. Incognito / dusra network se site
              kholo — IP yahan dikhega. (Admin browser count nahi hota.)
            </AdminCard>
          ) : (
            rows.map((v) => {
              const active = selectedId === v.id;
              const isChecked = checked.has(v.id);
              return (
                <AdminCard
                  key={v.id}
                  className={`p-4 transition ${
                    active ? "border-[#00a581]/50" : ""
                  } ${isChecked ? "ring-1 ring-[#fe5f50]/40" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(v.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-[color:var(--a-border)] accent-[#00a581]"
                      aria-label={`Select ${v.geo?.ip || v.id}`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelectedId(v.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-base font-semibold text-[var(--a-text)]">
                          {v.geo?.ip || "IP pending…"}
                        </p>
                        {v.geo?.countryCode ? (
                          <Badge tone="blue">{v.geo.countryCode}</Badge>
                        ) : (
                          <Badge tone="coral">no country</Badge>
                        )}
                        <span className="text-[11px] text-[color:var(--a-faint)]">
                          {relativeDay(v.lastSeenAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--a-muted)]">
                        {locLine(v) || "Location unknown"}
                        {latLong(v) ? ` · ${latLong(v)}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[color:var(--a-muted)]">
                        <span>
                          <span className="text-[color:var(--a-faint)]">
                            Visits
                          </span>{" "}
                          {v.visitCount || 1}
                        </span>
                        <span>
                          <span className="text-[color:var(--a-faint)]">
                            Stay
                          </span>{" "}
                          {formatDuration(v.totalDurationMs || 0)}
                        </span>
                        <span>
                          <span className="text-[color:var(--a-faint)]">
                            Hits
                          </span>{" "}
                          {v.hits || 1}
                        </span>
                        {v.path ? (
                          <span className="truncate font-mono">{v.path}</span>
                        ) : null}
                      </div>
                    </button>
                    <DeleteBtn
                      label="Delete"
                      className="shrink-0 px-3 py-1.5 text-xs"
                      onClick={() => onDeleteVisitor(v)}
                    />
                  </div>
                </AdminCard>
              );
            })
          )}
          </div>
        </div>

        <AdminCard className="h-fit max-h-[min(70vh,calc(100dvh-14rem))] overflow-y-auto overscroll-contain p-5 xl:sticky xl:top-4">
          {!selected ? (
            <p className="text-sm text-[color:var(--a-faint)]">
              Detail ke liye left se visitor select karo.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-lg font-semibold text-[var(--a-text)] break-all">
                  {selected.geo?.ip || "IP not captured"}
                </p>
                <p className="text-xs text-[color:var(--a-faint)]">
                  First seen {relativeDay(selected.firstSeenAt)} · Last{" "}
                  {relativeDay(selected.lastSeenAt)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--a-faint)]">
                    Visits
                  </p>
                  <p className="text-xl font-semibold text-[var(--a-text)]">
                    {selected.visitCount || 1}
                  </p>
                </div>
                <div className="rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--a-faint)]">
                    Time on site
                  </p>
                  <p className="text-xl font-semibold text-[var(--a-text)]">
                    {formatDuration(selected.totalDurationMs || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-3 text-xs text-[color:var(--a-muted)]">
                <p>
                  <span className="text-[color:var(--a-faint)]">Country</span>{" "}
                  {selected.geo?.country
                    ? selected.geo.countryCode &&
                      selected.geo.country !== selected.geo.countryCode
                      ? `${selected.geo.country} (${selected.geo.countryCode})`
                      : selected.geo.country
                    : selected.geo?.countryCode || "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Region</span>{" "}
                  {selected.geo?.region || "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">City</span>{" "}
                  {selected.geo?.city || "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Latitude</span>{" "}
                  {typeof selected.geo?.latitude === "number"
                    ? selected.geo.latitude.toFixed(5)
                    : "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Longitude</span>{" "}
                  {typeof selected.geo?.longitude === "number"
                    ? selected.geo.longitude.toFixed(5)
                    : "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Timezone</span>{" "}
                  {selected.geo?.timezone || "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">ISP</span>{" "}
                  {selected.geo?.isp || "—"}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Hits</span>{" "}
                  {selected.hits || 1}
                </p>
                <p>
                  <span className="text-[color:var(--a-faint)]">Last path</span>{" "}
                  <span className="font-mono">{selected.path || "—"}</span>
                </p>
                {selected.geo?.ip ? (
                  <button
                    type="button"
                    className="mt-2 rounded-full border border-[color:var(--a-border)] px-3 py-1 text-[11px] font-semibold text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                    onClick={() => {
                      void (async () => {
                        try {
                          setGeoMsg("Enriching geo…");
                          const res = await fetch(
                            `/api/visitor-geo?ip=${encodeURIComponent(selected.geo!.ip!)}`,
                            { cache: "no-store" },
                          );
                          if (!res.ok) throw new Error("Lookup failed");
                          const geo = (await res.json()) as {
                            ip?: string;
                            country?: string;
                            countryCode?: string;
                            region?: string;
                            city?: string;
                            latitude?: number;
                            longitude?: number;
                            timezone?: string;
                            isp?: string;
                          };
                          const { updateVisitorGeo } = await import(
                            "@/lib/crm-storage"
                          );
                          updateVisitorGeo(selected.visitorKey, {
                            ...geo,
                            fetchedAt: new Date().toISOString(),
                          });
                          reload("Geo enriched");
                          setGeoMsg("Geo updated");
                        } catch {
                          setGeoMsg("Could not enrich geo");
                        }
                      })();
                    }}
                  >
                    Re-fetch geo (lat/long/ISP)
                  </button>
                ) : null}
                {geoMsg ? (
                  <p className="text-[11px] text-[color:var(--a-faint)]">
                    {geoMsg}
                  </p>
                ) : null}
                {selected.geoHistory && selected.geoHistory.length ? (
                  <div className="mt-2 border-t border-[color:var(--a-border)] pt-2">
                    <p className="mb-1 text-[color:var(--a-faint)]">
                      Previous IPs
                    </p>
                    <ul className="space-y-1">
                      {selected.geoHistory.map((h) => (
                        <li
                          key={`${h.ip}-${h.at}`}
                          className="font-mono text-[11px]"
                        >
                          {h.ip}
                          {h.city || h.country || h.region
                            ? ` · ${[h.city, h.region, h.country].filter(Boolean).join(", ")}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                  Pages viewed
                </p>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-[color:var(--a-muted)]">
                  {(selected.pageViews || []).length === 0 ? (
                    <li className="text-[color:var(--a-faint)]">No pages yet</li>
                  ) : (
                    (selected.pageViews || []).slice(0, 25).map((p) => (
                      <li key={p.id} className="flex justify-between gap-2">
                        <span className="truncate font-mono">{p.path}</span>
                        <span className="shrink-0 text-[color:var(--a-faint)]">
                          {formatDuration(p.durationMs || 0)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wide text-[color:var(--a-faint)]">
                  Sessions
                </p>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-[color:var(--a-muted)]">
                  {(selected.sessions || []).length === 0 ? (
                    <li className="text-[color:var(--a-faint)]">
                      No sessions yet
                    </li>
                  ) : (
                    (selected.sessions || []).slice(0, 10).map((s) => (
                      <li key={s.id} className="flex justify-between gap-2">
                        <span>{relativeDay(s.startedAt)}</span>
                        <span>
                          {formatDuration(s.durationMs || 0)} · {s.pageCount}{" "}
                          pages
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <p className="text-[11px] text-[color:var(--a-faint)]">
                Email chahiye ho to Leads / Contacts dekho — visitor list sirf
                anonymous traffic track karti hai.
              </p>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
