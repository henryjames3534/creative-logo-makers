import { NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";
import { normalizeGeoBlock, type GeoBlockConfig } from "@/lib/geo-block";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public read of geo-block config for proxy / edge checks.
 * Does not expose anything sensitive — only ISO country codes.
 */
export async function GET() {
  try {
    const data = await clmApiFetch<{
      ok: boolean;
      payload?: unknown;
    }>("/geo-block");
    const config = normalizeGeoBlock(data.ok ? data.payload : null);
    const body = {
      ok: true as const,
      enabled: config.enabled,
      blockedCountries: config.blockedCountries,
      updatedAt: config.updatedAt,
    };
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
      },
    });
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
  const data = await clmApiFetch("/geo-block", {
    method: "PUT",
    body: JSON.stringify({ payload: config, updatedAt: config.updatedAt }),
  });
  return NextResponse.json(
    { ok: data.ok, config, error: data.ok ? undefined : "Save failed" },
    { status: data.ok ? 200 : 502 },
  );
}
