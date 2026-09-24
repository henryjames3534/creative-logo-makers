"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminCard, Badge } from "@/components/admin/AdminUi";
import { listRememberedGoogleAccounts } from "@/lib/auth-storage";
import {
  attachVisitorEmail,
  formatDuration,
  loadCrm,
  onVisitorTracked,
  relativeDay,
  syncRememberedGoogleIntoVisitors,
  updateVisitorGeo,
  type CrmGeo,
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
  const [state, setState] = useState<CrmState | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  function reload(msg?: string) {
    const next = loadCrm();
    setState(next);
    setDrafts(draftsFromState(next));
    if (msg) setHint(msg);
  }

  function pullGoogleEmails() {
    const accounts = listRememberedGoogleAccounts();
    if (!accounts.length) {
      setHint(
        "Abhi koi Google account remember nahi. Site pe One Tap → Continue as… dabao — email yahan auto aa jayegi.",
      );
      return;
    }
    syncRememberedGoogleIntoVisitors(accounts);
    reload(
      `Google se fill: ${accounts.map((a) => a.email).join(", ")}`,
    );
  }

  useEffect(() => {
    const next = loadCrm();
    setState(next);
    setDrafts(draftsFromState(next));
    // Auto-fill from any remembered Google logins
    const accounts = listRememberedGoogleAccounts();
    if (accounts.length) {
      syncRememberedGoogleIntoVisitors(accounts);
      const after = loadCrm();
      setState(after);
      setDrafts(draftsFromState(after));
    }
    return onVisitorTracked(() => {
      const s = loadCrm();
      setState(s);
      setDrafts(draftsFromState(s));
    });
  }, []);

  const rows = useMemo(() => {
    if (!state?.visitors) return [];
    return [...state.visitors]
      .filter((v) => {
        const d = drafts[v.id];
        const hay =
          `${v.email ?? ""} ${d?.email ?? ""} ${v.name ?? ""} ${d?.name ?? ""} ${v.geo?.city ?? ""} ${v.geo?.ip ?? ""}`.toLowerCase();
        return !q.trim() || hay.includes(q.trim().toLowerCase());
      })
      .sort((a, b) => +new Date(b.lastSeenAt) - +new Date(a.lastSeenAt));
  }, [state, q, drafts]);

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

  async function refreshGeo() {
    if (!selected) return;
    setGeoLoading(true);
    setGeoMsg(null);
    try {
      const res = await fetch("/api/visitor-geo", { cache: "no-store" });
      if (!res.ok) throw new Error("Geo lookup failed");
      const geo = (await res.json()) as CrmGeo;
      setGeoMsg(
        geo.country || geo.city
          ? "Location updated."
          : "Public IP lookup empty — retry shortly.",
      );
      updateVisitorGeo(selected.visitorKey, geo, selected.email);
      reload();
    } catch {
      setGeoMsg("Could not reach geo service.");
    } finally {
      setGeoLoading(false);
    }
  }

  if (!state) return <p className="text-white/50">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Visitors</h1>
          <p className="mt-1 text-sm text-white/50">
            Email tab aaegi jab visitor Google pe{" "}
            <strong className="text-white/80">Continue as…</strong> dabaye —
            ya neeche se remembered Google sync karo.
          </p>
        </div>
        <button
          type="button"
          onClick={pullGoogleEmails}
          className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
        >
          Fetch Google emails
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
        placeholder="Search visitors…"
        className="w-full rounded-lg border border-white/10 bg-[#171a21] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-3">
          {rows.length === 0 ? (
            <AdminCard className="p-8 text-center text-sm text-white/40">
              Koi visitor nahi. Pehle site kholo, phir Google Continue dabao.
            </AdminCard>
          ) : (
            rows.map((v) => {
              const d = drafts[v.id] || { name: "", email: "" };
              const active = selectedId === v.id;
              return (
                <AdminCard
                  key={v.id}
                  className={`p-4 transition ${
                    active ? "border-[#00a581]/50" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="mb-3 flex w-full flex-wrap items-center justify-between gap-2 text-left"
                    onClick={() => setSelectedId(v.id)}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={d.email || v.email ? "green" : "coral"}>
                        {d.email || v.email ? "email ready" : "email missing"}
                      </Badge>
                      <Badge tone="blue">
                        {SOURCE_LABEL[v.source] || v.source}
                      </Badge>
                      <span className="text-[11px] text-white/35">
                        {relativeDay(v.lastSeenAt)} · {v.geo?.ip || "IP…"}
                      </span>
                    </div>
                  </button>

                  <form
                    onSubmit={(e) => saveVisitorEmail(v, e)}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <label className="min-w-0 flex-1 basis-full text-xs text-white/50 sm:min-w-[140px] sm:basis-auto">
                      Name
                      <input
                        value={d.name}
                        onChange={(e) =>
                          setDraft(v.id, { name: e.target.value })
                        }
                        onFocus={() => setSelectedId(v.id)}
                        placeholder="Henry James"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
                      />
                    </label>
                    <label className="min-w-0 flex-[1.4] basis-full text-xs text-white/50 sm:min-w-[200px] sm:basis-auto">
                      Email
                      <input
                        type="email"
                        value={d.email}
                        onChange={(e) =>
                          setDraft(v.id, { email: e.target.value })
                        }
                        onFocus={() => setSelectedId(v.id)}
                        placeholder="Continue Google → auto fill"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-white outline-none focus:border-[#00a581]"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-full bg-[#00a581] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008f70]"
                    >
                      Save email
                    </button>
                  </form>
                  {savedId === v.id ? (
                    <p className="mt-2 text-xs text-[#5ee0bf]">
                      Saved {d.email}
                    </p>
                  ) : !d.email ? (
                    <p className="mt-2 text-[11px] text-white/35">
                      Email empty = Google Continue abhi nahi hua. Site pe
                      popup → <span className="text-white/60">Continue as…</span>{" "}
                      dabao, ya upar <span className="text-white/60">Fetch Google emails</span>.
                    </p>
                  ) : null}
                </AdminCard>
              );
            })
          )}
        </div>

        <AdminCard className="h-fit p-5">
          {!selected ? (
            <p className="text-sm text-white/40">
              Detail ke liye left se visitor select karo.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-white break-all">
                  {selected.email ||
                    drafts[selected.id]?.email ||
                    "Anonymous visitor"}
                </p>
                <p className="text-xs text-white/45">
                  {relativeDay(selected.lastSeenAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={refreshGeo}
                disabled={geoLoading}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5 disabled:opacity-50"
              >
                {geoLoading ? "Fetching…" : "Refresh IP / location"}
              </button>
              {geoMsg ? (
                <p className="text-[11px] text-white/45">{geoMsg}</p>
              ) : null}
              <div className="space-y-1 rounded-xl border border-white/10 bg-[#0f1115] p-3 text-xs text-white/70">
                <p>
                  <span className="text-white/40">IP</span>{" "}
                  {selected.geo?.ip || "—"}
                </p>
                <p>
                  <span className="text-white/40">Country</span>{" "}
                  {selected.geo?.country || "—"}
                </p>
                <p>
                  <span className="text-white/40">City</span>{" "}
                  {selected.geo?.city || "—"}
                </p>
                <p>
                  <span className="text-white/40">Visits</span>{" "}
                  {selected.visitCount} ·{" "}
                  {formatDuration(selected.totalDurationMs)}
                </p>
              </div>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-white/55">
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
