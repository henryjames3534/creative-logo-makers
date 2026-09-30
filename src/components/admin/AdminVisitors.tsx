"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCard, Badge, DeleteBtn } from "@/components/admin/AdminUi";
import {
  attachVisitorEmail,
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
  type VisitorSource,
} from "@/lib/crm-storage";

const SOURCE_LABEL: Record<VisitorSource, string> = {
  google_onetap: "Google One Tap",
  google_button: "Google button",
  login_form: "Login form",
  signup_form: "Signup form",
  remembered: "Remembered",
  manual: "Manual",
  page_visit: "Page visit",
  portal: "Customer portal",
};

type Drafts = Record<string, { name: string; email: string }>;

function draftsFromState(state: CrmState): Drafts {
  const d: Drafts = {};
  for (const v of state.visitors) {
    d[v.id] = {
      name: v.name && v.name !== "Anonymous" ? v.name : "",
      email: v.email || "",
    };
  }
  return d;
}

export function AdminVisitors() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function reload(msg?: string) {
    const next = loadCrm();
    setState(next);
    setDrafts(draftsFromState(next));
    if (msg) setHint(msg);
  }

  function pullGoogleEmails() {
    setHint(
      "Google emails ab site pe visitor jab Continue kare tabhi aati hain — admin browser ke Gmail visitors mein add nahi hote.",
    );
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
      // Mark this browser as staff so public pings stop counting it
      rememberStaffEmail("admin@creativelogomakers.com");
      const next = loadCrm();
      // Purge fake "remembered" rows created from admin Google accounts
      const junk = (next.visitors || []).filter((v) => !isWebsiteVisitor(v));
      if (junk.length) {
        deleteVisitors(junk.map((v) => v.id));
      }
      const cleaned = loadCrm();
      setState(cleaned);
      setDrafts(draftsFromState(cleaned));
      if (junk.length) {
        setHint(
          `${junk.length} admin/staff fake visitor rows cleaned (Google remembered /admin).`,
        );
      }
    })();

    const offHydrated = onCrmHydrated((s) => {
      setState(s);
      setDrafts(draftsFromState(s));
    });
    const offTracked = onVisitorTracked(() => {
      const s = loadCrm();
      setState(s);
      setDrafts(draftsFromState(s));
    });
    // Poll server every 20s so other visitors/forms show up without refresh
    const poll = window.setInterval(() => {
      void hydrateCrmFromServer().catch(() => null);
    }, 20000);

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
      .filter((v) => isWebsiteVisitor(v))
      .filter((v) => {
        const d = drafts[v.id];
        const hay =
          `${v.email ?? ""} ${d?.email ?? ""} ${v.name ?? ""} ${d?.name ?? ""} ${v.geo?.city ?? ""} ${v.geo?.ip ?? ""} ${v.path ?? ""}`.toLowerCase();
        return !q.trim() || hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => +new Date(b.lastSeenAt) - +new Date(a.lastSeenAt));
  }, [state, q, drafts]);

  const allChecked = rows.length > 0 && rows.every((v) => checked.has(v.id));
  const checkedCount = rows.filter((v) => checked.has(v.id)).length;

  const selected: CrmVisitor | null = useMemo(() => {
    if (!state || !selectedId) return null;
    return state.visitors.find((v) => v.id === selectedId) || null;
  }, [state, selectedId]);

  function setDraft(id: string, patch: Partial<{ name: string; email: string }>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        name: patch.name ?? prev[id]?.name ?? "",
        email: patch.email ?? prev[id]?.email ?? "",
      },
    }));
  }

  function saveVisitorEmail(v: CrmVisitor, e?: FormEvent) {
    e?.preventDefault();
    const d = drafts[v.id] || { name: "", email: "" };
    const email = d.email.trim();
    if (!email) {
      setHint("Email field khali hai — Continue Google pe dabao ya email paste karo.");
      return;
    }
    attachVisitorEmail({
      visitorId: v.id,
      visitorKey: v.visitorKey,
      email,
      name: d.name.trim() || undefined,
    });
    reload(`Saved ${email.toLowerCase()}`);
    setSavedId(v.id);
    window.setTimeout(() => setSavedId((id) => (id === v.id ? null : id)), 2500);
  }

  function onDeleteVisitor(v: CrmVisitor) {
    if (
      !window.confirm(
        `Delete visitor ${v.email || v.name || v.geo?.ip || v.id}?`,
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
        `Delete ${ids.length} selected website visitor${ids.length > 1 ? "s" : ""}?`,
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
          <h1 className="text-2xl font-semibold text-[var(--a-text)]">Visitors</h1>
          <p className="mt-1 text-sm text-[color:var(--a-muted)]">
            Sirf website visitors — admin/designer dashboard traffic yahan nahi
            aati. Multi-select se bulk delete bhi kar sakte ho.
          </p>
        </div>
        <button
          type="button"
          onClick={pullGoogleEmails}
          className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm font-medium text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
        >
          How emails appear
        </button>
      </div>

      {hint ? (
        <p className="rounded-xl border border-[#00a581]/30 bg-[#00a581]/10 px-3 py-2 text-xs text-[#5ee0bf]">
          {hint}
        </p>
      ) : null}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search website visitors…"
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
            label={checkedCount ? `Delete selected (${checkedCount})` : "Delete selected"}
            className={checkedCount ? "" : "pointer-events-none opacity-40"}
            onClick={() => {
              if (!checkedCount) return;
              onBulkDelete();
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-3">
          {rows.length === 0 ? (
            <AdminCard className="p-8 text-center text-sm text-[color:var(--a-faint)]">
              Koi website visitor nahi. Pehle public site kholo (admin nahi).
            </AdminCard>
          ) : (
            rows.map((v) => {
              const d = drafts[v.id] || { name: "", email: "" };
              const active = selectedId === v.id;
              const isChecked = checked.has(v.id);
              return (
                <AdminCard
                  key={v.id}
                  className={`p-4 transition ${
                    active ? "border-[#00a581]/50" : ""
                  } ${isChecked ? "ring-1 ring-[#fe5f50]/40" : ""}`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(v.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-[color:var(--a-border)] accent-[#00a581]"
                      aria-label={`Select visitor ${v.geo?.ip || v.id}`}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelectedId(v.id)}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={d.email || v.email ? "green" : "coral"}>
                            {d.email || v.email ? "email ready" : "email missing"}
                          </Badge>
                          <Badge tone="blue">
                            {SOURCE_LABEL[v.source] || v.source}
                          </Badge>
                          <span className="text-[11px] text-[color:var(--a-faint)]">
                            {relativeDay(v.lastSeenAt)}
                          </span>
                        </div>
                        <p className="font-mono text-sm font-semibold text-[var(--a-text)]">
                          {v.geo?.ip || "IP not captured"}
                        </p>
                        <p className="text-[11px] text-[color:var(--a-muted)]">
                          {[v.geo?.city, v.geo?.country || v.geo?.countryCode]
                            .filter(Boolean)
                            .join(", ") || "Location unknown"}
                          {v.path ? ` · ${v.path}` : ""}
                          {v.geoHistory && v.geoHistory.length
                            ? ` · +${v.geoHistory.length} older IP`
                            : ""}
                        </p>
                      </div>
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => saveVisitorEmail(v, e)}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <label className="min-w-0 flex-1 basis-full text-xs text-[color:var(--a-muted)] sm:min-w-[140px] sm:basis-auto">
                      Name
                      <input
                        value={d.name}
                        onChange={(e) =>
                          setDraft(v.id, { name: e.target.value })
                        }
                        onFocus={() => setSelectedId(v.id)}
                        placeholder="Henry James"
                        className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
                      />
                    </label>
                    <label className="min-w-0 flex-[1.4] basis-full text-xs text-[color:var(--a-muted)] sm:min-w-[200px] sm:basis-auto">
                      Email
                      <input
                        type="email"
                        value={d.email}
                        onChange={(e) =>
                          setDraft(v.id, { email: e.target.value })
                        }
                        onFocus={() => setSelectedId(v.id)}
                        placeholder="Continue Google → auto fill"
                        className="mt-1 w-full rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-full bg-[#00a581] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f70]"
                    >
                      Save email
                    </button>
                    <DeleteBtn
                      label="Delete"
                      className="px-4 py-2.5 text-sm"
                      onClick={() => onDeleteVisitor(v)}
                    />
                  </form>
                  {savedId === v.id ? (
                    <p className="mt-2 text-xs text-[#5ee0bf]">
                      Saved {d.email}
                    </p>
                  ) : !d.email ? (
                    <p className="mt-2 text-[11px] text-[color:var(--a-faint)]">
                      Email empty = Google Continue abhi nahi hua. Site pe
                      popup → <span className="text-[color:var(--a-muted)]">Continue as…</span>{" "}
                      dabao, ya upar <span className="text-[color:var(--a-muted)]">Fetch Google emails</span>.
                    </p>
                  ) : null}
                </AdminCard>
              );
            })
          )}
        </div>

        <AdminCard className="h-fit p-5">
          {!selected ? (
            <p className="text-sm text-[color:var(--a-faint)]">
              Detail ke liye left se visitor select karo.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-[var(--a-text)] break-all">
                  {selected.email ||
                    drafts[selected.id]?.email ||
                    "Anonymous visitor"}
                </p>
                <p className="text-xs text-[color:var(--a-faint)]">
                  {relativeDay(selected.lastSeenAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void hydrateCrmFromServer().then(() => reload("Synced from server"));
                }}
                className="rounded-full border border-[color:var(--a-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
              >
                Sync from server
              </button>
              {geoMsg ? (
                <p className="text-[11px] text-[color:var(--a-faint)]">{geoMsg}</p>
              ) : null}
              <div className="space-y-1 rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-3 text-xs text-[color:var(--a-muted)]">
                <p>
                  <span className="text-[color:var(--a-faint)]">IP</span>{" "}
                  <span className="font-mono text-sm font-semibold text-[var(--a-text)]">
                    {selected.geo?.ip || "Not captured"}
                  </span>
                </p>
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
                  <span className="text-[color:var(--a-faint)]">State / Region</span>{" "}
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
                  <span className="text-[color:var(--a-faint)]">Visits</span>{" "}
                  {selected.visitCount} ·{" "}
                  {formatDuration(selected.totalDurationMs)}
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
                          updateVisitorGeo(
                            selected.visitorKey,
                            {
                              ...geo,
                              fetchedAt: new Date().toISOString(),
                            },
                            selected.email,
                          );
                          reload("Geo enriched");
                          setGeoMsg("Geo updated from IP lookup");
                        } catch {
                          setGeoMsg("Could not enrich geo for this IP");
                        }
                      })();
                    }}
                  >
                    Enrich geo (lat/long/ISP)
                  </button>
                ) : null}
                {selected.geoHistory && selected.geoHistory.length ? (
                  <div className="mt-2 border-t border-[color:var(--a-border)] pt-2">
                    <p className="mb-1 text-[color:var(--a-faint)]">Previous IPs</p>
                    <ul className="space-y-1">
                      {selected.geoHistory.map((h) => (
                        <li key={`${h.ip}-${h.at}`} className="font-mono text-[11px]">
                          {h.ip}
                          {h.city || h.country || h.region
                            ? ` · ${[h.city, h.region, h.country].filter(Boolean).join(", ")}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {!selected.geo?.ip ? (
                  <p className="mt-2 text-[11px] text-amber-200/80">
                    Ye visitor tracking se pehle aaya — us waqt IP save nahi hui.
                    Dobara site visit pe IP capture ho jayegi.
                  </p>
                ) : null}
              </div>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-[color:var(--a-muted)]">
                {(selected.pageViews || []).slice(0, 15).map((p) => (
                  <li key={p.id}>
                    {p.path} · {formatDuration(p.durationMs)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
