import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

function clientIp(req: NextRequest) {
  const candidates = [
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    req.headers.get("x-real-ip")?.trim(),
    req.headers.get("cf-connecting-ip")?.trim(),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (!isPrivateIp(c)) return c;
  }
  return "";
}

async function lookupIpwho(ip?: string): Promise<GeoPayload | null> {
  // Blank path → service resolves the outbound public IP (works on localhost)
  const url = ip && !isPrivateIp(ip)
    ? `https://ipwho.is/${encodeURIComponent(ip)}`
    : "https://ipwho.is/";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
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
    isp?: string;
  };
  if (data.success === false) return null;
  const tz =
    typeof data.timezone === "string" ? data.timezone : data.timezone?.id;
  return {
    ip: data.ip,
    country: data.country,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: tz,
    isp: data.connection?.isp || data.isp,
  };
}

async function lookupIpapi(): Promise<GeoPayload | null> {
  const res = await fetch("https://ipapi.co/json/", {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    error?: boolean;
    ip?: string;
    country_name?: string;
    country_code?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    org?: string;
  };
  if (data.error) return null;
  return {
    ip: data.ip,
    country: data.country_name,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    isp: data.org,
  };
}

export async function GET(req: NextRequest) {
  const hinted = clientIp(req);

  try {
    let geo = await lookupIpwho(hinted || undefined);
    if (!geo?.country) {
      geo = (await lookupIpapi()) || geo;
    }
    if (!geo?.country) {
      // Last resort: public IP then reverse lookup
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json", {
          cache: "no-store",
        });
        if (ipRes.ok) {
          const { ip } = (await ipRes.json()) as { ip?: string };
          if (ip) geo = (await lookupIpwho(ip)) || geo;
        }
      } catch {
        /* ignore */
      }
    }

    if (!geo) {
      return NextResponse.json({ ip: hinted || undefined } satisfies GeoPayload);
    }
    return NextResponse.json(geo);
  } catch {
    return NextResponse.json({ ip: hinted || undefined } satisfies GeoPayload);
  }
}
