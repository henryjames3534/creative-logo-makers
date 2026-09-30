"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import { COUNTRIES, countryName } from "@/data/countries";
import {
  crmStats,
  loadCrm,
  resetCrm,
  type CrmState,
} from "@/lib/crm-storage";
import {
  emptyGeoBlock,
  hydrateGeoBlock,
  saveGeoBlock,
  type GeoBlockConfig,
} from "@/lib/geo-block";
import {
  clearSiteLogo,
  DEFAULT_SITE_LOGO,
  getSiteLogo,
  hydrateSiteLogoFromServer,
  onSiteLogoChange,
  readLogoFile,
  setSiteLogo,
  type SiteLogoData,
} from "@/lib/site-brand";

export function AdminSettings() {
  const [state, setState] = useState<CrmState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [logo, setLogo] = useState<SiteLogoData | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [geo, setGeo] = useState<GeoBlockConfig>(emptyGeoBlock());
  const [geoQ, setGeoQ] = useState("");
  const [geoSaving, setGeoSaving] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  useEffect(() => {
    setState(loadCrm());
    setLogo(getSiteLogo());
    void hydrateSiteLogoFromServer().then((next) => setLogo(next));
    void hydrateGeoBlock().then((next) => setGeo(next));
    return onSiteLogoChange((next) => setLogo(next));
  }, []);

  const filteredCountries = useMemo(() => {
    const q = geoQ.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [geoQ]);

  const blockedSet = useMemo(
    () => new Set(geo.blockedCountries),
    [geo.blockedCountries],
  );

  function onReset() {
    if (
      !window.confirm(
        "Reset CRM to seed data? This clears local leads, deals, and notes.",
      )
    ) {
      return;
    }
    const next = resetCrm();
    setState({ ...next });
    setMsg("CRM reset to demo seed data.");
  }

  async function onLogoPick(file: File | null) {
    if (!file) return;
    setLogoError(null);
    setUploading(true);
    try {
      const src = await readLogoFile(file);
      const next = setSiteLogo({ src, fileName: file.name });
      setLogo(next);
      const { putStoreDocument } = await import("@/lib/db-sync");
      const saved = await putStoreDocument("brand", next, next.updatedAt);
      if (!saved.ok) {
        setLogoError(
          "Logo saved on this device, but database sync failed. Try again.",
        );
        setMsg(null);
      } else {
        setMsg(
          "Logo saved to database — all visitors will see it (may take a refresh).",
        );
      }
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onLogoReset() {
    clearSiteLogo();
    setLogo(getSiteLogo());
    setMsg("Logo reset to default Creative Logo Makers mark.");
  }

  function onLogoSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function toggleCountry(code: string) {
    setGeo((prev) => {
      const set = new Set(prev.blockedCountries);
      if (set.has(code)) set.delete(code);
      else set.add(code);
      return {
        ...prev,
        blockedCountries: Array.from(set).sort(),
      };
    });
  }

  const visibleCodes = useMemo(
    () => filteredCountries.map((c) => c.code),
    [filteredCountries],
  );
  const allVisibleSelected =
    visibleCodes.length > 0 &&
    visibleCodes.every((code) => blockedSet.has(code));
  const someVisibleSelected =
    visibleCodes.some((code) => blockedSet.has(code)) && !allVisibleSelected;

  function toggleSelectAllVisible() {
    setGeo((prev) => {
      const set = new Set(prev.blockedCountries);
      if (allVisibleSelected) {
        for (const code of visibleCodes) set.delete(code);
      } else {
        for (const code of visibleCodes) set.add(code);
      }
      return {
        ...prev,
        blockedCountries: Array.from(set).sort(),
      };
    });
  }

  async function persistGeo(next: GeoBlockConfig) {
    setGeoSaving(true);
    setGeoMsg(null);
    const res = await saveGeoBlock({
      enabled: next.enabled,
      blockedCountries: next.blockedCountries,
    });
    setGeo(res.config);
    setGeoSaving(false);
    if (!res.ok) {
      setGeoMsg(res.error || "Save failed — kept on this device only.");
      return;
    }
    setGeoMsg(
      next.enabled
        ? `Geo-block ON · ${next.blockedCountries.length} countries blocked.`
        : "Geo-block saved (currently OFF).",
    );
  }

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  const stats = crmStats(state);
  const previewSrc = logo?.src || DEFAULT_SITE_LOGO;
  const isCustom = Boolean(logo?.src?.startsWith("data:"));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          Brand logo, geo-block, team, and demo controls.
        </p>
      </div>

      <AdminCard className="p-5">
        <SectionTitle title="Geo-block countries" />
        <p className="mb-4 text-sm text-[color:var(--a-muted)]">
          Select countries where the public site should not open. Visitors from
          those regions see a blocked page. Admin / API always stay accessible.
        </p>

        <label className="mb-4 flex cursor-pointer items-center gap-3 text-sm text-[var(--a-text)]">
          <input
            type="checkbox"
            checked={geo.enabled}
            onChange={(e) =>
              setGeo((g) => ({ ...g, enabled: e.target.checked }))
            }
            className="h-4 w-4 accent-[#00a581]"
          />
          Enable geo-blocking
        </label>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={geoQ}
            onChange={(e) => setGeoQ(e.target.value)}
            placeholder="Search country…"
            className="min-w-[200px] flex-1 rounded-lg border border-[color:var(--a-border)] bg-[var(--a-bg)] px-3 py-2 text-sm text-[var(--a-text)] outline-none focus:border-[#00a581]"
          />
          <Badge tone={geo.enabled ? "coral" : "neutral"}>
            {geo.blockedCountries.length} selected
          </Badge>
        </div>

        {geo.blockedCountries.length ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {geo.blockedCountries.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleCountry(code)}
                className="rounded-full border border-[#fe5f50]/40 bg-[#fe5f50]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--a-badge-coral-fg)]"
                title="Click to unblock"
              >
                {countryName(code)} ({code}) ×
              </button>
            ))}
          </div>
        ) : null}

        <div className="max-h-72 overflow-y-auto rounded-xl border border-[color:var(--a-border)]">
          <label className="sticky top-0 z-[1] flex cursor-pointer items-center gap-3 border-b border-[color:var(--a-border)] bg-[var(--a-panel)] px-3 py-2.5 text-sm font-semibold text-[var(--a-text)]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = someVisibleSelected;
              }}
              onChange={toggleSelectAllVisible}
              className="h-4 w-4 accent-[#fe5f50]"
            />
            <span className="min-w-0 flex-1">
              {allVisibleSelected ? "Deselect all" : "Select all"}
              {geoQ.trim()
                ? ` (${filteredCountries.length} shown)`
                : ` (${COUNTRIES.length} countries)`}
            </span>
          </label>
          <ul className="divide-y divide-[color:var(--a-border)]">
            {filteredCountries.map((c) => {
              const on = blockedSet.has(c.code);
              return (
                <li key={c.code}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--a-hover)]">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleCountry(c.code)}
                      className="h-4 w-4 accent-[#fe5f50]"
                    />
                    <span className="min-w-0 flex-1 text-[var(--a-text)]">
                      {c.name}
                    </span>
                    <span className="font-mono text-[11px] text-[color:var(--a-faint)]">
                      {c.code}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={geoSaving}
            onClick={() => void persistGeo(geo)}
            className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70] disabled:opacity-50"
          >
            {geoSaving ? "Saving…" : "Save geo-block"}
          </button>
          <button
            type="button"
            disabled={geoSaving || !geo.blockedCountries.length}
            onClick={() => {
              const cleared = {
                ...geo,
                blockedCountries: [] as string[],
                enabled: false,
              };
              setGeo(cleared);
              void persistGeo(cleared);
            }}
            className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm text-[color:var(--a-muted)] hover:bg-[var(--a-hover)] disabled:opacity-50"
          >
            Clear all
          </button>
        </div>
        {geoMsg ? (
          <p className="mt-3 text-xs text-[#5ee0bf]">{geoMsg}</p>
        ) : null}
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Site logo" />
        <p className="mb-4 text-sm text-[color:var(--a-muted)]">
          Upload a logo — it saves to the database and shows on every device /
          browser (header and footer).
        </p>
        <form
          onSubmit={onLogoSubmit}
          className="flex flex-col gap-5 md:flex-row md:items-start"
        >
          <div className="flex h-28 w-full max-w-xs items-center justify-center rounded-xl border border-dashed border-[color:var(--a-border-strong)] bg-white px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Current site logo"
              className="max-h-20 w-auto max-w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="block w-full text-sm text-[color:var(--a-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[#5b8def] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--a-text)] hover:file:bg-[#4a7de0]"
              disabled={uploading}
              onChange={(e) => onLogoPick(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-[color:var(--a-faint)]">
              PNG / JPG / WebP / SVG · max 1.5 MB
              {logo?.fileName ? ` · Current: ${logo.fileName}` : ""}
              {logo?.updatedAt
                ? ` · Updated ${new Date(logo.updatedAt).toLocaleString()}`
                : ""}
            </p>
            {logoError ? (
              <p className="text-sm text-[#ff9a90]">{logoError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full bg-[#5b8def] px-4 py-2 text-sm font-semibold text-[var(--a-text)] hover:bg-[#4a7de0] disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Choose logo"}
              </button>
              {isCustom ? (
                <button
                  type="button"
                  onClick={onLogoReset}
                  className="rounded-full border border-[color:var(--a-border-strong)] px-4 py-2 text-sm text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
                >
                  Reset to default
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Team owners" />
        <div className="grid gap-3 sm:grid-cols-2">
          {state.owners.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-[color:var(--a-border)] bg-[var(--a-bg)] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-[var(--a-text)]">{o.name}</p>
                <Badge tone="green">{o.role}</Badge>
              </div>
              <p className="mt-1 text-xs text-[color:var(--a-faint)]">{o.email}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Data snapshot" />
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p className="text-[color:var(--a-muted)]">
            Leads{" "}
            <span className="font-semibold text-[var(--a-text)]">
              {stats.totalLeads}
            </span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Contacts{" "}
            <span className="font-semibold text-[var(--a-text)]">
              {stats.contacts}
            </span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Companies{" "}
            <span className="font-semibold text-[var(--a-text)]">
              {stats.companies}
            </span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Orders{" "}
            <span className="font-semibold text-[var(--a-text)]">
              {stats.ordersCount}
            </span>
          </p>
        </div>
        <p className="mt-4 text-xs text-[color:var(--a-faint)]">
          CRM syncs to Postgres. Logo is stored in the{" "}
          <code className="text-[color:var(--a-muted)]">brand</code> document so
          every visitor sees the same header/footer logo.
        </p>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Data controls" />
        <p className="text-sm text-[color:var(--a-muted)]">
          Reset local CRM seed data (leads, deals, sample records). Live chat
          and visitor captures are not wiped by this action.
        </p>
        {msg ? <p className="mt-2 text-xs text-[#5ee0bf]">{msg}</p> : null}
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-full border border-[#fe5f50]/40 px-4 py-2 text-sm font-semibold text-[#ff9a90] hover:bg-[#fe5f50]/10"
        >
          Reset CRM seed
        </button>
      </AdminCard>
    </div>
  );
}
