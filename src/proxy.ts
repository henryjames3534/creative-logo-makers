import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.creativelogomakers.com";
const APEX_HOST = "creativelogomakers.com";

/**
 * Force HTTPS + www so the address bar never stays on plain HTTP
 * (Chrome "Not secure").
 */
export function proxy(request: NextRequest) {
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
