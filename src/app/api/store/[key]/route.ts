import { NextRequest, NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";
import { mergeCrmDocuments, mergeUsersDocuments } from "@/lib/merge-store";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["crm", "users", "chat", "brand", "geo-block"]);

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { key } = await ctx.params;
  if (!ALLOWED.has(key)) {
    return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 400 });
  }
  const data = await clmApiFetch<{
    id?: string;
    payload?: unknown;
    updatedAt?: string | null;
  }>(`/${key}`);
  return NextResponse.json(data, { status: data.ok ? 200 : 502 });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { key } = await ctx.params;
  if (!ALLOWED.has(key)) {
    return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 400 });
  }

  let body: { payload?: unknown; updatedAt?: string };
  try {
    body = (await req.json()) as { payload?: unknown; updatedAt?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  let payload = body.payload;
  const updatedAt = body.updatedAt || new Date().toISOString();

  // Merge with existing server doc so one browser can't wipe others
  if (key === "crm" || key === "users") {
    const current = await clmApiFetch<{
      ok: boolean;
      payload?: unknown;
      updatedAt?: string | null;
    }>(`/${key}`);
    if (current.ok && current.payload != null) {
      payload =
        key === "crm"
          ? mergeCrmDocuments(current.payload, payload)
          : mergeUsersDocuments(current.payload, payload);
    }
  }

  const data = await clmApiFetch(`/${key}`, {
    method: "PUT",
    body: JSON.stringify({ payload, updatedAt }),
  });
  return NextResponse.json(data, { status: data.ok ? 200 : 502 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return PUT(req, ctx);
}
