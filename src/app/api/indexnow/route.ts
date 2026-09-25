import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";
import { submitIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";

/**
 * POST /api/indexnow
 * Body: { urls: string[] } or empty for default priority URLs
 * Header: x-internal-api-key (same as INTERNAL_API_KEY) when set
 */
export async function POST(req: Request) {
  const expected = process.env.INTERNAL_API_KEY;
  if (expected) {
    const got = req.headers.get("x-internal-api-key") || "";
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let urls: string[] = [];
  try {
    const json = (await req.json()) as { urls?: string[] };
    if (Array.isArray(json?.urls)) urls = json.urls;
  } catch {
    /* empty body → defaults */
  }

  if (!urls.length) {
    urls = [
      `${SITE_URL}/`,
      `${SITE_URL}/us`,
      `${SITE_URL}/us/new-york/logo-design`,
      `${SITE_URL}/us/los-angeles/web-design`,
      `${SITE_URL}/us/chicago/mobile-app-design`,
      `${SITE_URL}/logo-design/details`,
      `${SITE_URL}/web-design/details`,
      `${SITE_URL}/mobile-app-design/details`,
      `${SITE_URL}/get-started`,
      `${SITE_URL}/categories`,
      `${SITE_URL}/pricing`,
    ];
  }

  const result = await submitIndexNow(urls);
  return NextResponse.json(
    { ...result, count: urls.length },
    { status: result.ok ? 200 : 502 },
  );
}
