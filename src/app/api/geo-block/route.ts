import { NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";
import {
  GEO_BLOCK_CRM_FIELD,
  geoBlockFromCrmPayload,
  normalizeGeoBlock,
  type GeoBlockConfig,
} from "@/lib/geo-block";
import { mergeCrmDocuments } from "@/lib/merge-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRM_PROXY =
  (process.env.CRM_STORE_PROXY_URL || "https://www.creativelogomakers.com/api/store/crm").trim();

async function readCrmPayload(): Promise<{
  ok: boolean;
  payload: Record<string, unknown> | null;
  error?: string;
}> {
  const data = await clmApiFetch<{
    ok: boolean;
    payload?: unknown;
    error?: string;
  }>("/crm");

  if (data.ok && data.payload && typeof data.payload === "object") {
    return { ok: true, payload: data.payload as Record<string, unknown> };
  }

  // awsvision deploy may lack INTERNAL_API_KEY — read via www store.
  if (data.error === "INTERNAL_API_KEY is not set" && CRM_PROXY) {
    try {
      const res = await fetch(CRM_PROXY, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        payload?: unknown;
        error?: string;
      } | null;
      if (json?.ok && json.payload && typeof json.payload === "object") {
        return { ok: true, payload: json.payload as Record<string, unknown> };
      }
      return { ok: false, payload: null, error: json?.error || "CRM proxy failed" };
    } catch (e) {
      return {
        ok: false,
        payload: null,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return {
    ok: false,
    payload: null,
    error: data.error || "Could not read CRM",
  };
}

async function writeCrmPayload(
  payload: Record<string, unknown>,
  updatedAt: string,
): Promise<{ ok: boolean; error?: string }> {
  const data = await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({ payload, updatedAt }),
  });

  if (data.ok) return { ok: true };

  if (data.error === "INTERNAL_API_KEY is not set" && CRM_PROXY) {
    try {
      const res = await fetch(CRM_PROXY, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, updatedAt }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (res.ok && json?.ok) return { ok: true };
      return { ok: false, error: json?.error || `CRM proxy HTTP ${res.status}` };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return { ok: false, error: data.error || "Could not save CRM" };
}

/**
 * Public read of geo-block config for proxy / edge checks.
 * Stored on CRM.geoBlock because payment /clm-api/geo-block does not exist.
 */
export async function GET() {
  try {
    const crm = await readCrmPayload();
    const config = geoBlockFromCrmPayload(crm.payload);
    return NextResponse.json(
      {
        ok: true as const,
        enabled: config.enabled,
        blockedCountries: config.blockedCountries,
        updatedAt: config.updatedAt,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json({
      ok: true,
      enabled: false,
      blockedCountries: [] as string[],
      updatedAt: null,
    });
  }
}

export async function PUT(req: Request) {
  let body: Partial<GeoBlockConfig>;
  try {
    body = (await req.json()) as Partial<GeoBlockConfig>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const config = normalizeGeoBlock({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  const crm = await readCrmPayload();
  const base = crm.payload || { version: 1 };
  const merged = mergeCrmDocuments(base, {
    version: 1,
    [GEO_BLOCK_CRM_FIELD]: config,
  });

  const saved = await writeCrmPayload(merged, config.updatedAt);
  if (!saved.ok) {
    return NextResponse.json(
      { ok: false, config, error: saved.error || "Save failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, config });
}
