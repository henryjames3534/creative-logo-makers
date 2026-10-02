import { NextResponse } from "next/server";
import { clmApiFetch } from "@/lib/clm-api";
import { mergeCrmDocuments } from "@/lib/merge-store";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/smtp-mail";
import {
  upsellInvoiceHtml,
  upsellInvoiceSubject,
  upsellInvoiceText,
} from "@/lib/upsell-mail";

export const runtime = "nodejs";

const DEFAULT_CRM_PROXY =
  "https://www.creativelogomakers.com/api/store/crm";
const SITE = "https://www.creativelogomakers.com";

function crmProxyUrl() {
  return (process.env.CRM_STORE_PROXY_URL ?? DEFAULT_CRM_PROXY).trim();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

type UpsellBody = {
  projectId?: string;
  orderId?: string;
  title?: string;
  details?: string;
  amount?: number;
  currency?: string;
  sendEmail?: boolean;
};

type OrderRow = Record<string, unknown> & {
  id?: string;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  title?: string;
  categoryName?: string;
  upsells?: Record<string, unknown>[];
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
 * POST /api/crm/upsell
 * Create an upsell invoice under a project, email customer, sync CRM.
 */
export async function POST(req: Request) {
  let body: UpsellBody;
  try {
    body = (await req.json()) as UpsellBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = String(body.projectId || "").trim();
  const orderCode = String(body.orderId || "").trim();
  const title = String(body.title || "").trim();
  const details = String(body.details || "").trim();
  const amount = Math.max(0, Number(body.amount) || 0);
  const currency = String(body.currency || "USD").trim() || "USD";
  const sendEmail = body.sendEmail !== false;

  if (!projectId && !orderCode) {
    return NextResponse.json(
      { ok: false, error: "projectId or orderId required" },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "title required" },
      { status: 400 },
    );
  }
  if (!(amount > 0)) {
    return NextResponse.json(
      { ok: false, error: "amount must be > 0" },
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
  const match = orders.find(
    (o) =>
      (projectId && String(o.id || "") === projectId) ||
      (orderCode && String(o.orderId || "") === orderCode),
  );

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Project not found" },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  const payToken = uid("upt");
  const upsell = {
    id: uid("up"),
    title,
    details,
    amount,
    currency,
    status: "invoiced" as const,
    invoicedAt: now,
    createdAt: now,
    updatedAt: now,
    createdBy: "own_admin",
    payToken,
  };

  const prevUpsells = Array.isArray(match.upsells) ? match.upsells : [];
  const updatedOrder: OrderRow = {
    ...match,
    upsells: [upsell, ...prevUpsells],
    updatedAt: now,
  };

  const activity = {
    id: uid("ac"),
    type: "payment",
    title: `Upsell invoiced · ${String(match.orderId || "")}`,
    body: `${title} · $${amount} · ${String(match.customerEmail || "")}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: String(match.id || ""),
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

  const email = String(match.customerEmail || "")
    .trim()
    .toLowerCase();
  const payUrl = `${SITE}/pay/upsell?token=${encodeURIComponent(payToken)}`;
  const accountUrl = `${SITE}/account`;

  let emailed = false;
  let emailError: string | undefined;
  if (sendEmail && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const mail = {
      customerName: String(match.customerName || email.split("@")[0]),
      customerEmail: email,
      orderId: String(match.orderId || ""),
      projectTitle: String(
        match.title || match.categoryName || "Your project",
      ),
      upsellTitle: title,
      details,
      amount,
      currency,
      payUrl,
      accountUrl,
    };
    try {
      if (isSmtpConfigured()) {
        await sendSmtpMail({
          to: email,
          subject: upsellInvoiceSubject(mail),
          text: upsellInvoiceText(mail),
          html: upsellInvoiceHtml(mail),
        });
        emailed = true;
      } else {
        emailError = "SMTP is not configured";
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Email failed";
    }
  }

  return NextResponse.json({
    ok: true,
    upsell,
    projectId: String(match.id || ""),
    orderId: String(match.orderId || ""),
    payUrl,
    emailed,
    emailError,
  });
}
