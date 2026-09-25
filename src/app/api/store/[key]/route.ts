import { NextRequest, NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["crm", "users", "chat"]);

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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const data = await clmApiFetch(`/${key}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return NextResponse.json(data, { status: data.ok ? 200 : 502 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return PUT(req, ctx);
}
