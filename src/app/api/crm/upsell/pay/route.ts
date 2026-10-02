import { NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";
import { mergeCrmDocuments } from "@/lib/merge-store";

export const runtime = "nodejs";

const DEFAULT_CRM_PROXY =
  "https://www.creativelogomakers.com/api/store/crm";

function crmProxyUrl() {
  return (process.env.CRM_STORE_PROXY_URL ?? DEFAULT_CRM_PROXY).trim();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

type PayBody = {
  token?: string;
  payToken?: string;
  projectId?: string;
  upsellId?: string;
};

type UpsellRow = Record<string, unknown> & {
  id?: string;
  title?: string;
  amount?: number;
  status?: string;
  payToken?: string;
  paidAt?: string;
  updatedAt?: string;
};

type OrderRow = Record<string, unknown> & {
  id?: string;
  orderId?: string;
  customerEmail?: string;
  upsells?: UpsellRow[];
};

async function readCrm(): Promise<{
  ok: boolean;
  payload: Record<string, unknown> | null;
  error?: string;
}> {
  const current = await clmApiFetch<{
    ok: boolean;
    payload?: unknown;
    error?: string;
  }>("/crm");

  if (current.ok && current.payload && typeof current.payload === "object") {
    return { ok: true, payload: current.payload as Record<string, unknown> };
  }

  if (current.error === "INTERNAL_API_KEY is not set") {
    try {
      const res = await fetch(crmProxyUrl(), { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        payload?: unknown;
        error?: string;
      } | null;
      if (json?.ok && json.payload && typeof json.payload === "object") {
        return { ok: true, payload: json.payload as Record<string, unknown> };
      }
      return {
        ok: false,
        payload: null,
        error: json?.error || "CRM proxy failed",
      };
    } catch (e) {
      return {
        ok: false,
        payload: null,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return {
    ok: false,
    payload: null,
    error: current.error || "CRM fetch failed",
  };
}

async function writeCrm(payload: Record<string, unknown>, updatedAt: string) {
  const put = await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({ payload, updatedAt }),
  });
  if (put.ok) return { ok: true as const };

  if ((put as { error?: string }).error === "INTERNAL_API_KEY is not set") {
    try {
      const res = await fetch(crmProxyUrl(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, updatedAt }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (res.ok && json?.ok) return { ok: true as const };
      return {
        ok: false as const,
        error: json?.error || `CRM proxy HTTP ${res.status}`,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "CRM proxy failed",
      };
    }
  }

  return {
    ok: false as const,
    error: (put as { error?: string }).error || "CRM put failed",
  };
}

/**
 * GET /api/crm/upsell/pay?token=…
 * Lookup invoice for public pay page.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = (
    url.searchParams.get("token") ||
    url.searchParams.get("payToken") ||
    ""
  ).trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "token required" },
      { status: 400 },
    );
  }

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return NextResponse.json(
      { ok: false, error: current.error || "CRM read failed" },
      { status: 502 },
    );
  }

  const orders = Array.isArray(current.payload.orders)
    ? (current.payload.orders as OrderRow[])
    : [];

  for (const o of orders) {
    for (const u of o.upsells || []) {
      if (String(u.payToken || "") !== token) continue;
      return NextResponse.json({
        ok: true,
        invoice: {
          id: u.id,
          title: u.title,
          details: u.details,
          amount: u.amount,
          currency: u.currency || "USD",
          status: u.status,
          paidAt: u.paidAt,
          invoicedAt: u.invoicedAt,
        },
        project: {
          id: o.id,
          orderId: o.orderId,
          title: o.title || o.categoryName,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          packageName: o.packageName,
          amount: o.amount,
        },
      });
    }
  }

  return NextResponse.json(
    { ok: false, error: "Invoice not found" },
    { status: 404 },
  );
}

/**
 * POST /api/crm/upsell/pay
 * Mark upsell paid by token or projectId+upsellId.
 */
export async function POST(req: Request) {
  let body: PayBody;
  try {
    body = (await req.json()) as PayBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const token = String(body.token || body.payToken || "").trim();
  const projectId = String(body.projectId || "").trim();
  const upsellId = String(body.upsellId || "").trim();

  if (!token && !(projectId && upsellId)) {
    return NextResponse.json(
      { ok: false, error: "token or projectId+upsellId required" },
      { status: 400 },
    );
  }

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return NextResponse.json(
      { ok: false, error: current.error || "CRM read failed" },
      { status: 502 },
    );
  }

  const orders = Array.isArray(current.payload.orders)
    ? (current.payload.orders as OrderRow[])
    : [];

  let hit: { order: OrderRow; upsell: UpsellRow } | null = null;
  for (const o of orders) {
    for (const u of o.upsells || []) {
      if (token && String(u.payToken || "") === token) {
        hit = { order: o, upsell: u };
        break;
      }
      if (
        upsellId &&
        String(u.id || "") === upsellId &&
        (!projectId || String(o.id || "") === projectId)
      ) {
        hit = { order: o, upsell: u };
        break;
      }
    }
    if (hit) break;
  }

  if (!hit) {
    return NextResponse.json(
      { ok: false, error: "Invoice not found" },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  if (String(hit.upsell.status || "") === "paid") {
    return NextResponse.json({
      ok: true,
      alreadyPaid: true,
      upsell: hit.upsell,
      projectId: hit.order.id,
      orderId: hit.order.orderId,
    });
  }

  const paidUpsell: UpsellRow = {
    ...hit.upsell,
    status: "paid",
    paidAt: now,
    updatedAt: now,
  };

  const nextUpsells = (hit.order.upsells || []).map((u) =>
    String(u.id || "") === String(hit!.upsell.id || "") ? paidUpsell : u,
  );

  const updatedOrder: OrderRow = {
    ...hit.order,
    upsells: nextUpsells,
    updatedAt: now,
  };

  const activity = {
    id: uid("ac"),
    type: "payment",
    title: `Upsell paid · ${String(hit.order.orderId || "")}`,
    body: `${String(paidUpsell.title || "Upsell")} · $${Number(paidUpsell.amount) || 0} · ${String(hit.order.customerEmail || "")}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: String(hit.order.id || ""),
  };

  const merged = mergeCrmDocuments(current.payload, {
    version: 1,
    orders: [updatedOrder],
    activities: [activity],
  });

  const put = await writeCrm(merged, now);
  if (!put.ok) {
    return NextResponse.json(
      { ok: false, error: put.error || "CRM write failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    upsell: paidUpsell,
    projectId: hit.order.id,
    orderId: hit.order.orderId,
  });
}
