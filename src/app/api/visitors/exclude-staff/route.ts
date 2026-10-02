import { NextRequest, NextResponse } from "next/server";
import { isPrivateIp } from "@/lib/ip-geo";
import { excludeStaffIp } from "@/lib/server-visitor";

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

/**
 * POST /api/visitors/exclude-staff
 * Called from admin shell after login — marks this browser's public IP
 * so it never appears in Visitors.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!ip || isPrivateIp(ip)) {
    return NextResponse.json(
      { ok: false, error: "Could not resolve public IP" },
      { status: 400 },
    );
  }

  const result = await excludeStaffIp(ip);
  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
