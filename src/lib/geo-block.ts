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

/** Nested on the CRM store document (payment API has no /geo-block key). */
export const GEO_BLOCK_CRM_FIELD = "geoBlock";

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

export function geoBlockFromCrmPayload(payload: unknown): GeoBlockConfig {
  if (!payload || typeof payload !== "object") return emptyGeoBlock();
  const field = (payload as Record<string, unknown>)[GEO_BLOCK_CRM_FIELD];
  return normalizeGeoBlock(field);
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
    // Prefer dedicated API (reads CRM.geoBlock on the server)
    const res = await fetch("/api/geo-block", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        ok?: boolean;
        enabled?: boolean;
        blockedCountries?: string[];
        updatedAt?: string | null;
      };
      if (data.ok !== false) {
        const remote = normalizeGeoBlock({
          enabled: data.enabled,
          blockedCountries: data.blockedCountries,
          updatedAt: data.updatedAt || undefined,
        });
        writeGeoBlockLocal(remote);
        return remote;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const doc = await fetchStoreDocument<Record<string, unknown>>("crm");
    if (doc.ok && doc.payload) {
      const remote = geoBlockFromCrmPayload(doc.payload);
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

  try {
    const res = await fetch("/api/geo-block", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      config?: GeoBlockConfig;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        config: next,
        error: data.error || "Could not sync geo-block to server.",
      };
    }
    const saved = normalizeGeoBlock(data.config || next);
    writeGeoBlockLocal(saved);
    return { ok: true, config: saved };
  } catch (e) {
    // Fallback: nest into CRM document directly
    try {
      const doc = await fetchStoreDocument<Record<string, unknown>>("crm");
      const base =
        doc.ok && doc.payload && typeof doc.payload === "object"
          ? doc.payload
          : { version: 1 };
      const payload = {
        ...base,
        version: 1,
        [GEO_BLOCK_CRM_FIELD]: next,
      };
      const saved = await putStoreDocument("crm", payload, next.updatedAt);
      if (!saved.ok) {
        return {
          ok: false,
          config: next,
          error: saved.error || "Could not sync geo-block to server.",
        };
      }
      return { ok: true, config: next };
    } catch (err) {
      return {
        ok: false,
        config: next,
        error:
          err instanceof Error
            ? err.message
            : e instanceof Error
              ? e.message
              : "Save failed",
      };
    }
  }
}
