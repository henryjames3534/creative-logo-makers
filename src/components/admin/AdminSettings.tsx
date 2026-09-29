"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  crmStats,
  loadCrm,
  resetCrm,
  type CrmState,
} from "@/lib/crm-storage";
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

  useEffect(() => {
    setState(loadCrm());
    setLogo(getSiteLogo());
    void hydrateSiteLogoFromServer().then((next) => setLogo(next));
    return onSiteLogoChange((next) => setLogo(next));
  }, []);

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
      // Ensure Postgres write finished (setSiteLogo also kicks this off)
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

  if (!state) return <p className="text-[color:var(--a-muted)]">Loading…</p>;

  const stats = crmStats(state);
  const previewSrc = logo?.src || DEFAULT_SITE_LOGO;
  const isCustom = Boolean(logo?.src?.startsWith("data:"));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[color:var(--a-muted)]">
          Brand logo, team, storage, and demo controls.
        </p>
      </div>

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <p className="text-[color:var(--a-muted)]">
            Leads{" "}
            <span className="font-semibold text-[var(--a-text)]">{stats.totalLeads}</span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Contacts{" "}
            <span className="font-semibold text-[var(--a-text)]">{stats.contacts}</span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Companies{" "}
            <span className="font-semibold text-[var(--a-text)]">{stats.companies}</span>
          </p>
          <p className="text-[color:var(--a-muted)]">
            Orders{" "}
            <span className="font-semibold text-[var(--a-text)]">{stats.ordersCount}</span>
          </p>
        </div>
        <p className="mt-4 text-xs text-[color:var(--a-faint)]">
          CRM syncs to Postgres. Logo is stored in the{" "}
          <code className="text-[color:var(--a-muted)]">brand</code> document so every
          visitor sees the same header/footer logo.
        </p>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Data controls" />
        <p className="text-sm text-[color:var(--a-muted)]">
          Reset local CRM seed data (leads, deals, sample records). Live chat
          and visitor captures are not wiped by this action.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-full border border-[#fe5f50]/40 px-4 py-2 text-sm font-semibold text-[#ff9a90] hover:bg-[#fe5f50]/10"
        >
          Reset CRM seed data
        </button>
        {msg ? (
          <p className="mt-3 text-sm text-[#5ee0bf]">{msg}</p>
        ) : null}
      </AdminCard>
    </div>
  );
}
