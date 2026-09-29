import { NextRequest, NextResponse } from "next/server";
import { enrichGeo, isPrivateIp } from "@/lib/ip-geo";

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
  return "";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const queryIp = (url.searchParams.get("ip") || "").trim();
  const hinted = queryIp || clientIp(req);

  const edgeCountry = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    ""
  )
    .trim()
    .toUpperCase();

  const cityHeader = req.headers.get("x-vercel-ip-city");
  const edge = {
    ip: hinted || undefined,
    countryCode:
      edgeCountry && edgeCountry !== "XX" && edgeCountry !== "T1"
        ? edgeCountry
        : undefined,
    country:
      edgeCountry && edgeCountry !== "XX" && edgeCountry !== "T1"
        ? edgeCountry
        : undefined,
    city: cityHeader ? decodeURIComponent(cityHeader) : undefined,
    region: req.headers.get("x-vercel-ip-country-region") || undefined,
  };

  try {
    const geo = await enrichGeo({ ip: hinted || undefined, edge });
    return NextResponse.json(geo);
  } catch {
    return NextResponse.json({ ip: hinted || undefined });
  }
}
