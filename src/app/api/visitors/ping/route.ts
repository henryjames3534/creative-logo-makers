import { NextRequest, NextResponse } from "next/server";
import { enrichGeo, isPrivateIp } from "@/lib/ip-geo";
import {
  getExcludedVisitorIps,
  upsertVisitorOnServer,
} from "@/lib/server-visitor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clientIp(req: NextRequest) {
  const candidates = [
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    req.headers.get("x-real-ip")?.trim(),
    req.headers.get("cf-connecting-ip")?.trim(),
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim(),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (!isPrivateIp(c)) return c;
  }
  return candidates[0] || "";
}

async function resolveGeo(req: NextRequest) {
  const ip = clientIp(req);
  const edgeCountry = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    ""
  )
    .trim()
    .toUpperCase();

  const cityHeader = req.headers.get("x-vercel-ip-city");
  const city = cityHeader ? decodeURIComponent(cityHeader) : undefined;
  const region = req.headers.get("x-vercel-ip-country-region") || undefined;

  const edge =
    edgeCountry && edgeCountry !== "XX" && edgeCountry !== "T1"
      ? {
          ip: ip || undefined,
          countryCode: edgeCountry,
          country: edgeCountry,
          city,
          region,
        }
      : { ip: ip || undefined, city, region };

  return enrichGeo({ ip, edge });
}

/**
 * POST /api/visitors/ping
 * Anonymous traffic only — IP/geo/duration from server. No email.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const visitorKey = String(body.visitorKey ?? "").trim();
  if (!visitorKey || visitorKey.length > 120) {
    return NextResponse.json(
      { ok: false, error: "visitorKey required" },
      { status: 400 },
    );
  }

  const path = String(body.path ?? "/").trim().slice(0, 500);
  if (path.startsWith("/admin") || path.startsWith("/designer")) {
    return NextResponse.json({ ok: true, skipped: true, reason: "internal_path" });
  }

  const ip = clientIp(req).trim().toLowerCase();
  if (ip) {
    const blocked = await getExcludedVisitorIps();
    if (blocked.includes(ip)) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "staff_ip",
      });
    }
  }

  const geo = await resolveGeo(req);
  const result = await upsertVisitorOnServer({
    visitorKey,
    path,
    userAgent: String(body.userAgent ?? "").trim().slice(0, 400) || undefined,
    language: String(body.language ?? "").trim().slice(0, 40) || undefined,
    durationMs: Number(body.durationMs) || 0,
    pageDurationMs: Number(body.pageDurationMs) || 0,
    isNewSession: Boolean(body.isNewSession),
    geo,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
