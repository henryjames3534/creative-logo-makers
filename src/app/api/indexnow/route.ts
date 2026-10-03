import { NextResponse } from "next/server";
import { submitIndexNow } from "@/lib/indexnow";
import { listAllSeoUrls, listPrioritySeoUrls } from "@/lib/seo-sitemaps";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/indexnow
 * Body: { urls?: string[], scope?: "priority" | "all" }
 * Header: x-internal-api-key when INTERNAL_API_KEY is set
 *
 * GET /api/indexnow → sitemap ping helpers + counts (no auth)
 */
export async function GET() {
  const all = listAllSeoUrls();
  const priority = listPrioritySeoUrls();
  return NextResponse.json({
    ok: true,
    site: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
    counts: { all: all.length, priority: priority.length },
    hint: 'POST { "scope": "all" } or { "scope": "priority" } to submit IndexNow',
  });
}

export async function POST(req: Request) {
  const expected = process.env.INTERNAL_API_KEY;
  if (expected) {
    const got = req.headers.get("x-internal-api-key") || "";
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let urls: string[] = [];
  let scope: "priority" | "all" | "custom" = "priority";
  try {
    const json = (await req.json()) as {
      urls?: string[];
      scope?: "priority" | "all";
    };
    if (Array.isArray(json?.urls) && json.urls.length) {
      urls = json.urls;
      scope = "custom";
    } else if (json?.scope === "all") {
      urls = listAllSeoUrls();
      scope = "all";
    } else {
      urls = listPrioritySeoUrls();
      scope = "priority";
    }
  } catch {
    urls = listPrioritySeoUrls();
    scope = "priority";
  }

  // IndexNow allows up to 10k URLs per request — batch defensively
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += 1000) {
    batches.push(urls.slice(i, i + 1000));
  }

  const results: { ok: boolean; status: number; count: number }[] = [];
  for (const batch of batches) {
    const result = await submitIndexNow(batch);
    results.push({
      ok: result.ok,
      status: result.status,
      count: batch.length,
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, scope, submitted: results, error: result.body },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    scope,
    total: urls.length,
    batches: results.length,
    results,
    sitemap: `${SITE_URL}/sitemap.xml`,
  });
}
