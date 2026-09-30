import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.creativelogomakers.com";
const APEX_HOST = "creativelogomakers.com";

type GeoBlockPayload = {
  enabled?: boolean;
  blockedCountries?: string[];
};

let geoCache: { at: number; enabled: boolean; blocked: Set<string> } | null =
  null;
const GEO_TTL_MS = 8_000;

async function loadBlockedCountries(request: NextRequest) {
  const now = Date.now();
  if (geoCache && now - geoCache.at < GEO_TTL_MS) {
    return geoCache;
  }
  try {
    const url = new URL("/api/geo-block", request.url);
    url.searchParams.set("_", String(now));
    const res = await fetch(url, {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      cache: "no-store",
      signal: AbortSignal.timeout
        ? AbortSignal.timeout(2500)
        : undefined,
    });
    if (!res.ok) {
      return geoCache || { at: now, enabled: false, blocked: new Set<string>() };
    }
    const data = (await res.json()) as GeoBlockPayload;
    const blocked = new Set(
      (data.blockedCountries || [])
        .map((c) => String(c).toUpperCase())
        .filter((c) => /^[A-Z]{2}$/.test(c)),
    );
    geoCache = {
      at: now,
      enabled: Boolean(data.enabled) && blocked.size > 0,
      blocked,
    };
    return geoCache;
  } catch {
    return geoCache || { at: now, enabled: false, blocked: new Set<string>() };
  }
}

function requestCountry(request: NextRequest) {
  const fromHeader = (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    ""
  )
    .trim()
    .toUpperCase();
  if (fromHeader && fromHeader !== "XX" && fromHeader !== "T1") {
    return fromHeader;
  }
  // Next.js / Vercel request geo (when provided by the platform)
  const geo = (
    request as NextRequest & { geo?: { country?: string | null } }
  ).geo?.country;
  const fromGeo = String(geo || "")
    .trim()
    .toUpperCase();
  if (fromGeo && fromGeo !== "XX" && fromGeo !== "T1") return fromGeo;
  return "";
}

function isExemptPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/designer") ||
    pathname.startsWith("/geo-blocked") ||
    pathname.startsWith("/_next")
  );
}

/**
 * Force HTTPS + www, and optionally geo-block selected countries.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get("host") || url.host || "")
    .toLowerCase()
    .split(":")[0];
  const proto = (
    request.headers.get("x-forwarded-proto") ||
    url.protocol.replace(":", "") ||
    "https"
  ).toLowerCase();

  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app");

  // Geo-block public site pages (admin / API always allowed)
  if (!isExemptPath(url.pathname)) {
    const country = requestCountry(request);
    if (country) {
      const geo = await loadBlockedCountries(request);
      if (geo.enabled && geo.blocked.has(country)) {
        const blockedUrl = request.nextUrl.clone();
        blockedUrl.pathname = "/geo-blocked";
        blockedUrl.search = "";
        return NextResponse.rewrite(blockedUrl);
      }
    }
  }

  if (isLocal) {
    return NextResponse.next();
  }

  const needsHttps = proto !== "https";
  const needsWww = host === APEX_HOST;

  if (needsHttps || needsWww) {
    url.protocol = "https:";
    if (needsWww) url.host = CANONICAL_HOST;
    else url.host = host;
    return NextResponse.redirect(url, 308);
  }

  const res = NextResponse.next();
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  res.headers.set("Content-Security-Policy", "upgrade-insecure-requests");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2)$).*)",
  ],
};
