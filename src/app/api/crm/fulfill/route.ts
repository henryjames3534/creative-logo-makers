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

type FulfillBody = {
  customerEmail?: string;
  customerName?: string;
  categoryName?: string;
  packageName?: string;
  packagePrice?: string;
  amount?: number;
  orderId?: string;
  serviceId?: string;
  hireMode?: "contest" | "direct";
  designerId?: string;
  designerName?: string;
  designerHandle?: string;
  paymentStatus?: "paid" | "pending";
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
      return { ok: false, payload: null, error: json?.error || "CRM proxy failed" };
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
 * POST /api/crm/fulfill
 * After package payment / brief attach — upsert order, lead, contact, deal on server CRM.
 */
export async function POST(req: Request) {
  let body: FulfillBody;
  try {
    body = (await req.json()) as FulfillBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.customerEmail || "")
    .trim()
    .toLowerCase();
  const name = String(body.customerName || "").trim() || (email ? email.split("@")[0] : "");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "customerEmail required" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const packageName = String(body.packageName || "Package").trim();
  const categoryName = String(body.categoryName || "Design").trim();
  const amount =
    Number(body.amount) ||
    Number(String(body.packagePrice || "").replace(/[^0-9.]/g, "")) ||
    0;
  const isDirect = body.hireMode === "direct" && Boolean(body.designerId);
  const paymentStatus = body.paymentStatus === "pending" ? "pending" : "paid";
  const orderCode =
    String(body.orderId || "").trim() ||
    `ORD-${uid("or").slice(-8).toUpperCase()}`;

  const contactId = uid("ct");
  const leadId = uid("ld");
  const dealId = uid("dl");
  const orderInternalId = uid("or");

  const contact = {
    id: contactId,
    name,
    email,
    title: "Customer",
    ownerId: "own_admin",
    tags: ["package", isDirect ? "direct-hire" : "contest", "paid"].filter(
      Boolean,
    ),
    createdAt: now,
    lastTouchAt: now,
  };

  const lead = {
    id: leadId,
    name,
    email,
    source: "Package brief",
    status: paymentStatus === "paid" ? "qualified" : "new",
    score: paymentStatus === "paid" ? 90 : 80,
    interest: `${categoryName} · ${packageName}`,
    valueEstimate: amount || 699,
    ownerId: "own_admin",
    notes: [
      `Package: ${packageName}${body.packagePrice ? ` (${body.packagePrice})` : ""}`,
      `Mode: ${isDirect ? "direct hire" : "contest"}`,
      body.designerName
        ? `Designer: ${body.designerName}${body.designerHandle ? ` (@${body.designerHandle})` : ""}`
        : "",
      `Order: ${orderCode}`,
    ]
      .filter(Boolean)
      .join("\n"),
    createdAt: now,
    updatedAt: now,
    contactId,
  };

  const deal = {
    id: dealId,
    title: `${categoryName} — ${name}`,
    stage: paymentStatus === "paid" ? "won" : "brief",
    value: amount || 699,
    currency: "USD",
    probability: paymentStatus === "paid" ? 100 : 45,
    contactId,
    leadId,
    ownerId: "own_admin",
    category: categoryName,
    packageName,
    closeDate: now,
    createdAt: now,
    updatedAt: now,
  };

  const order = {
    id: orderInternalId,
    orderId: orderCode,
    title: `${categoryName} — ${name}`,
    customerName: name,
    customerEmail: email,
    categoryName,
    packageName,
    amount: amount || 699,
    status: isDirect ? "designs_incoming" : "brief_submitted",
    paymentStatus,
    createdAt: now,
    updatedAt: now,
    designerCount: isDirect ? 1 : 0,
    revisionLimit: packageName.toLowerCase().includes("platinum")
      ? 5
      : packageName.toLowerCase().includes("gold")
        ? 4
        : 3,
    revisionsUsed: 0,
    revisions: [],
    messages: [],
    serviceId: body.serviceId,
    assignedDesignerIds: body.designerId ? [body.designerId] : [],
  };

  const activity = {
    id: uid("ac"),
    type: paymentStatus === "paid" ? "payment" : "deal",
    title: isDirect
      ? paymentStatus === "paid"
        ? "Direct hire paid"
        : "Direct hire brief"
      : paymentStatus === "paid"
        ? "Contest paid"
        : "Package brief",
    body: `${email} · ${packageName} · $${amount || 0} · ${orderCode}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: orderInternalId,
  };

  const current = await readCrm();
  if (!current.ok || !current.payload) {
    return NextResponse.json(
      { ok: false, error: current.error || "CRM read failed" },
      { status: 502 },
    );
  }

  // Prefer updating existing order by orderId / email+package when present
  const existingOrders = Array.isArray(current.payload.orders)
    ? (current.payload.orders as Record<string, unknown>[])
    : [];
  const match = existingOrders.find(
    (o) =>
      String(o.orderId || "") === orderCode ||
      (String(o.customerEmail || "").toLowerCase() === email &&
        String(o.packageName || "") === packageName &&
        String(o.serviceId || "") === String(body.serviceId || "")),
  );

  let ordersPatch = [order];
  if (match) {
    ordersPatch = [
      {
        ...match,
        ...order,
        id: String(match.id || order.id),
        orderId: String(match.orderId || order.orderId),
        paymentStatus,
        updatedAt: now,
        serviceId: body.serviceId || match.serviceId,
      },
    ];
  }

  const merged = mergeCrmDocuments(current.payload, {
    version: 1,
    contacts: [contact],
    leads: [lead],
    deals: [deal],
    orders: ordersPatch,
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
    orderId: orderCode,
    paymentStatus,
  });
}
