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

  if (!state) return <p className="text-white/50">Loading…</p>;

  const stats = crmStats(state);
  const previewSrc = logo?.src || DEFAULT_SITE_LOGO;
  const isCustom = Boolean(logo?.src?.startsWith("data:"));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Brand logo, team, storage, and demo controls.
        </p>
      </div>

      <AdminCard className="p-5">
        <SectionTitle title="Site logo" />
        <p className="mb-4 text-sm text-white/50">
          Upload a logo — it saves to the database and shows on every device /
          browser (header and footer).
        </p>
        <form
          onSubmit={onLogoSubmit}
          className="flex flex-col gap-5 md:flex-row md:items-start"
        >
          <div className="flex h-28 w-full max-w-xs items-center justify-center rounded-xl border border-dashed border-white/15 bg-white px-4">
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
              className="block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#5b8def] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#4a7de0]"
              disabled={uploading}
              onChange={(e) => onLogoPick(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-white/40">
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
                className="rounded-full bg-[#5b8def] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a7de0] disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Choose logo"}
              </button>
              {isCustom ? (
                <button
                  type="button"
                  onClick={onLogoReset}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
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
              className="rounded-xl border border-white/10 bg-[#0f1115] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-white">{o.name}</p>
                <Badge tone="green">{o.role}</Badge>
              </div>
              <p className="mt-1 text-xs text-white/45">{o.email}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Data snapshot" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <p className="text-white/60">
            Leads{" "}
            <span className="font-semibold text-white">{stats.totalLeads}</span>
          </p>
          <p className="text-white/60">
            Contacts{" "}
            <span className="font-semibold text-white">{stats.contacts}</span>
          </p>
          <p className="text-white/60">
            Companies{" "}
            <span className="font-semibold text-white">{stats.companies}</span>
          </p>
          <p className="text-white/60">
            Orders{" "}
            <span className="font-semibold text-white">{stats.ordersCount}</span>
          </p>
        </div>
        <p className="mt-4 text-xs text-white/40">
          CRM syncs to Postgres. Logo is stored in the{" "}
          <code className="text-white/60">brand</code> document so every
          visitor sees the same header/footer logo.
        </p>
      </AdminCard>

      <AdminCard className="p-5">
        <SectionTitle title="Demo access" />
        <p className="text-sm text-white/60">
          Sign in with{" "}
          <span className="font-medium text-white">
            admin@creativelogomakers.com
          </span>{" "}
          / <span className="font-medium text-white">admin123</span>
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
