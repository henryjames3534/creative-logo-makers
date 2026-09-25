/** Site brand logo — admin upload → Postgres + header/footer */

import { putStoreDocument, hydrateStoreKey } from "@/lib/db-sync";

const LOGO_KEY = "clm_site_logo_v1";
const LOGO_UPDATED_KEY = "clm_site_logo_updated_at";
export const SITE_LOGO_EVENT = "clm_site_logo";
export const DEFAULT_SITE_LOGO = "/brand/clm-logo-clear.png";

export type SiteLogoData = {
  /** data:image/...;base64,... or public path */
  src: string;
  fileName?: string;
  updatedAt: string;
};

function emitLogo(data: SiteLogoData) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SITE_LOGO_EVENT, { detail: data }));
}

export function getSiteLogo(): SiteLogoData {
  if (typeof window === "undefined") {
    return { src: DEFAULT_SITE_LOGO, updatedAt: "" };
  }
  try {
    const raw = localStorage.getItem(LOGO_KEY);
    if (!raw) return { src: DEFAULT_SITE_LOGO, updatedAt: "" };
    const parsed = JSON.parse(raw) as SiteLogoData;
    if (!parsed?.src) return { src: DEFAULT_SITE_LOGO, updatedAt: "" };
    return parsed;
  } catch {
    return { src: DEFAULT_SITE_LOGO, updatedAt: "" };
  }
}

function writeLocal(data: SiteLogoData) {
  localStorage.setItem(LOGO_KEY, JSON.stringify(data));
  localStorage.setItem(LOGO_UPDATED_KEY, data.updatedAt || new Date().toISOString());
}

export function setSiteLogo(input: {
  src: string;
  fileName?: string;
}): SiteLogoData {
  const data: SiteLogoData = {
    src: input.src,
    fileName: input.fileName,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    writeLocal(data);
    emitLogo(data);
    // Persist to Postgres so every browser/device gets the same logo
    void putStoreDocument("brand", data, data.updatedAt);
  }
  return data;
}

export function clearSiteLogo() {
  if (typeof window === "undefined") return;
  const data: SiteLogoData = { src: DEFAULT_SITE_LOGO, updatedAt: new Date().toISOString() };
  localStorage.removeItem(LOGO_KEY);
  localStorage.setItem(LOGO_UPDATED_KEY, data.updatedAt);
  emitLogo(data);
  void putStoreDocument("brand", data, data.updatedAt);
}

/** Pull logo from Postgres (or push local custom logo if server empty). */
export async function hydrateSiteLogoFromServer(): Promise<SiteLogoData> {
  if (typeof window === "undefined") {
    return { src: DEFAULT_SITE_LOGO, updatedAt: "" };
  }
  await hydrateStoreKey({
    key: "brand",
    localRaw: localStorage.getItem(LOGO_KEY),
    localUpdatedAt: localStorage.getItem(LOGO_UPDATED_KEY),
    writeLocal: (raw, updatedAt) => {
      try {
        const parsed = JSON.parse(raw) as SiteLogoData;
        if (parsed?.src) {
          writeLocal({ ...parsed, updatedAt: parsed.updatedAt || updatedAt });
          emitLogo(parsed);
        }
      } catch {
        /* ignore */
      }
    },
  });
  return getSiteLogo();
}

export function onSiteLogoChange(cb: (logo: SiteLogoData) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<SiteLogoData>).detail;
    cb(detail || getSiteLogo());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOGO_KEY) cb(getSiteLogo());
  };
  window.addEventListener(SITE_LOGO_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SITE_LOGO_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

/** Read file as data URL (max ~1.5MB for storage safety) */
export function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file (PNG, JPG, WebP, SVG)."));
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      reject(new Error("Image must be under 1.5 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (!result.startsWith("data:image/")) {
        reject(new Error("Could not read image."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
