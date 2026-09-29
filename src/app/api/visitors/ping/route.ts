import { NextRequest, NextResponse } from "next/server";
import { upsertVisitorOnServer } from "@/lib/server-visitor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type GeoPayload = {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
};

function isPrivateIp(ip: string) {
  const v = ip.trim().toLowerCase();
  if (!v) return true;
  if (v === "::1" || v === "127.0.0.1" || v === "localhost") return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("172.")) {
    const second = Number(v.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

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

async function resolveGeo(req: NextRequest): Promise<GeoPayload> {
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

  if (edgeCountry && edgeCountry !== "XX" && edgeCountry !== "T1") {
    return {
      ip: ip || undefined,
      countryCode: edgeCountry,
      country: edgeCountry,
      city,
      region,
    };
  }

  if (ip) {
    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          ip?: string;
          country?: string;
          country_code?: string;
          region?: string;
          city?: string;
          latitude?: number;
          longitude?: number;
          timezone?: { id?: string } | string;
          connection?: { isp?: string };
        };
        if (data.success !== false) {
          const tz =
            typeof data.timezone === "string"
              ? data.timezone
              : data.timezone?.id;
          return {
            ip: data.ip || ip,
            country: data.country,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: tz,
            isp: data.connection?.isp,
          };
        }
      }
    } catch {
      /* ignore */
    }
  }

  return { ip: ip || undefined };
}

/**
 * POST /api/visitors/ping
 * Body: { visitorKey, path?, email?, name?, userAgent?, language? }
 * Server captures real IP/geo and writes into CRM visitors.
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
  // Don't record admin/designer portal as public traffic
  if (path.startsWith("/admin") || path.startsWith("/designer")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const geo = await resolveGeo(req);
  const result = await upsertVisitorOnServer({
    visitorKey,
    path,
    email: String(body.email ?? "").trim() || undefined,
    name: String(body.name ?? "").trim() || undefined,
    userAgent: String(body.userAgent ?? "").trim().slice(0, 400) || undefined,
    language: String(body.language ?? "").trim().slice(0, 40) || undefined,
    geo,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
