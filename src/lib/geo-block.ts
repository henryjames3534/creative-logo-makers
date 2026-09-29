import {
  fetchStoreDocument,
  putStoreDocument,
} from "@/lib/db-sync";

export type GeoBlockConfig = {
  enabled: boolean;
  /** ISO 3166-1 alpha-2 country codes */
  blockedCountries: string[];
  updatedAt: string;
};

const LOCAL_KEY = "clm_geo_block_v1";

export function emptyGeoBlock(): GeoBlockConfig {
  return {
    enabled: false,
    blockedCountries: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeGeoBlock(raw: unknown): GeoBlockConfig {
  const base = emptyGeoBlock();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const codes = Array.isArray(o.blockedCountries)
    ? o.blockedCountries
        .map((c) => String(c || "").trim().toUpperCase())
        .filter((c) => /^[A-Z]{2}$/.test(c))
    : [];
  return {
    enabled: Boolean(o.enabled),
    blockedCountries: Array.from(new Set(codes)).sort(),
    updatedAt:
      typeof o.updatedAt === "string" && o.updatedAt
        ? o.updatedAt
        : base.updatedAt,
  };
}

export function readGeoBlockLocal(): GeoBlockConfig {
  if (typeof window === "undefined") return emptyGeoBlock();
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return emptyGeoBlock();
    return normalizeGeoBlock(JSON.parse(raw));
  } catch {
    return emptyGeoBlock();
  }
}

export function writeGeoBlockLocal(config: GeoBlockConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

export async function hydrateGeoBlock(): Promise<GeoBlockConfig> {
  const local = readGeoBlockLocal();
  try {
    const doc = await fetchStoreDocument<GeoBlockConfig>("geo-block");
    if (doc.ok && doc.payload) {
      const remote = normalizeGeoBlock(doc.payload);
      writeGeoBlockLocal(remote);
      return remote;
    }
  } catch {
    /* ignore */
  }
  return local;
}

export async function saveGeoBlock(
  patch: Partial<Pick<GeoBlockConfig, "enabled" | "blockedCountries">>,
): Promise<{ ok: boolean; config: GeoBlockConfig; error?: string }> {
  const next = normalizeGeoBlock({
    ...readGeoBlockLocal(),
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  writeGeoBlockLocal(next);
  const saved = await putStoreDocument("geo-block", next, next.updatedAt);
  if (!saved.ok) {
    return {
      ok: false,
      config: next,
      error: saved.error || "Could not sync geo-block to server.",
    };
  }
  return { ok: true, config: next };
}
