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

const BLOCKED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Unavailable in your region | Creative Logo Makers</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    body{
      min-height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#0f1115;
      color:#e8e7e4;
      font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      padding:24px;
      text-align:center;
    }
    .wrap{max-width:28rem}
    .eyebrow{
      font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#00a581
    }
    h1{margin-top:12px;font-size:1.5rem;line-height:1.25;font-weight:600}
    p{margin-top:12px;font-size:.9rem;line-height:1.5;color:rgba(255,255,255,.55)}
    a{color:#5ee0bf}
  </style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">Creative Logo Makers</p>
    <h1>This site is not available in your region</h1>
    <p>
      Access from your country has been restricted. If you believe this is a mistake, contact
      <a href="mailto:reply@creativelogomakers.com">reply@creativelogomakers.com</a>.
    </p>
  </div>
</body>
</html>`;

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
    pathname.startsWith("/_next")
  );
}

function blockedResponse() {
  return new NextResponse(BLOCKED_HTML, {
    status: 451,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/**
 * Force HTTPS + www, and optionally geo-block selected countries.
 * Blocked visitors get a bare HTML page — no site chrome.
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

  // Always serve bare block page for this path (no header/footer layout)
  if (url.pathname === "/geo-blocked" || url.pathname.startsWith("/geo-blocked/")) {
    return blockedResponse();
  }

  // Geo-block public site pages (admin / API always allowed)
  if (!isExemptPath(url.pathname)) {
    const country = requestCountry(request);
    if (country) {
      const geo = await loadBlockedCountries(request);
      if (geo.enabled && geo.blocked.has(country)) {
        return blockedResponse();
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
