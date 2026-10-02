import { NextResponse } from "next/server";
import { Resend } from "resend";
import { clmApiFetch, clmCreateLead } from "@/lib/clm-api";
import {
  FORM_FROM_EMAIL,
  FORM_NOTIFY_EMAIL,
  notifyHtml,
  notifySubject,
  notifyText,
  thankYouHtml,
  thankYouSubject,
  thankYouText,
  type LeadFormPayload,
  type LeadFormType,
} from "@/lib/form-mail";
import { mergeCrmDocuments } from "@/lib/merge-store";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/smtp-mail";

export const runtime = "nodejs";

const ALLOWED: LeadFormType[] = ["contact", "studio", "signup", "package"];

const DEFAULT_EMAIL_RELAY =
  "https://creative-logo-makers-lovat.vercel.app/api/forms/email";

const DEFAULT_CRM_PROXY =
  "https://www.creativelogomakers.com/api/store/crm";

function getResendKey() {
  return (process.env.RESEND_API_KEY ?? "").trim();
}

function emailRelayUrl() {
  return (process.env.FORM_EMAIL_RELAY_URL ?? DEFAULT_EMAIL_RELAY).trim();
}

function crmProxyUrl() {
  return (process.env.CRM_STORE_PROXY_URL ?? DEFAULT_CRM_PROXY).trim();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function normalize(body: unknown): LeadFormPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const form = String(b.form ?? "").trim() as LeadFormType;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const topic = String(b.topic ?? "").trim();
  const message = String(b.message ?? "").trim();
  const page = String(b.page ?? "").trim();

  if (!ALLOWED.includes(form)) return null;
  if (!name || name.length > 120) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return null;
  }
  if (message.length > 8000) return null;

  return {
    form,
    name,
    email,
    topic: topic || undefined,
    message: message || undefined,
    page: page || undefined,
  };
}

function sourceLabel(form: LeadFormType) {
  if (form === "contact") return "Contact form";
  if (form === "studio") return "Studio form";
  if (form === "package") return "Package brief";
  return "Signup";
}

function parsePackageMeta(payload: LeadFormPayload) {
  const message = payload.message || "";
  const topic = payload.topic || "";
  const packageLine = message.match(/Package:\s*([^(]+?)(?=\s*\(|$)/i);
  const priceLine = message.match(/Package:\s*[^(]+\(([^)]*)\)/i);
  const categoryLine = message.match(/Category:\s*(.+)/i);
  const packageName =
    (packageLine?.[1] || topic.split("·")[1] || "Package").trim() || "Package";
  const packagePriceRaw = (priceLine?.[1] || "").trim();
  const amount = Number(String(packagePriceRaw).replace(/[^0-9.]/g, "")) || 0;
  const categoryName =
    (categoryLine?.[1] || topic.split("·")[0] || payload.form).trim() ||
    "Design";
  return { packageName, packagePriceRaw, amount, categoryName };
}

function buildLeadPatch(payload: LeadFormPayload) {
  const now = new Date().toISOString();
  const source = sourceLabel(payload.form);
  const meta =
    payload.form === "package" ? parsePackageMeta(payload) : null;

  const valueEstimate =
    payload.form === "studio"
      ? 999
      : payload.form === "package"
        ? meta?.amount || 699
        : 499;

  const contactId = uid("ct");
  const leadId = uid("ld");
  const dealId = uid("dl");
  const orderIdInternal = uid("or");
  const orderCode = `ORD-${orderIdInternal.slice(-8).toUpperCase()}`;

  const contact = {
    id: contactId,
    name: payload.name,
    email: payload.email,
    title: payload.form === "package" ? "Customer" : undefined,
    ownerId: "own_admin",
    tags: [
      payload.form,
      payload.form === "package" ? "package-brief" : "website-form",
    ],
    createdAt: now,
    lastTouchAt: now,
  };

  const lead = {
    id: leadId,
    name: payload.name,
    email: payload.email,
    source,
    status: "new" as const,
    score:
      payload.form === "studio" ? 70 : payload.form === "package" ? 80 : 55,
    interest: payload.topic || payload.form,
    valueEstimate,
    ownerId: "own_admin",
    notes: [payload.message || "", payload.page ? `Page: ${payload.page}` : ""]
      .filter(Boolean)
      .join("\n"),
    createdAt: now,
    updatedAt: now,
    contactId,
  };

  const activity = {
    id: uid("ac"),
    type: "email",
    title: `Form: ${source}`,
    body: `${payload.name} <${payload.email}> — ${payload.topic || payload.form}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "lead",
    relatedId: lead.id,
  };

  const leadNote = {
    id: uid("ac"),
    type: "note",
    title: "New lead",
    body: `${payload.name} <${payload.email}> · ${source} · ${payload.topic || payload.form}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "lead",
    relatedId: lead.id,
  };

  const deals =
    payload.form === "package"
      ? [
          {
            id: dealId,
            title: `${meta?.categoryName || "Design"} — ${payload.name}`,
            stage: "brief" as const,
            value: valueEstimate,
            currency: "USD",
            probability: 45,
            contactId,
            leadId,
            customerEmail: payload.email,
            orderId: orderIdInternal,
            orderCode,
            ownerId: "own_admin",
            category: meta?.categoryName,
            packageName: meta?.packageName,
            closeDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: now,
            updatedAt: now,
          },
        ]
      : payload.form === "studio"
        ? [
            {
              id: dealId,
              title: `Studio — ${payload.name}`,
              stage: "qualified" as const,
              value: valueEstimate,
              currency: "USD",
              probability: 35,
              contactId,
              leadId,
              customerEmail: payload.email,
              ownerId: "own_admin",
              packageName: "Studio",
              closeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
              createdAt: now,
              updatedAt: now,
            },
          ]
        : [
            {
              id: dealId,
              title: `${payload.topic || source} — ${payload.name}`,
              stage: "lead" as const,
              value: valueEstimate,
              currency: "USD",
              probability: 15,
              contactId,
              leadId,
              customerEmail: payload.email,
              ownerId: "own_admin",
              packageName: payload.form === "signup" ? "Signup" : "Contact",
              closeDate: new Date(Date.now() + 45 * 86400000).toISOString(),
              createdAt: now,
              updatedAt: now,
            },
          ];

  const orders =
    payload.form === "package"
      ? [
          {
            id: orderIdInternal,
            orderId: orderCode,
            title: `${meta?.categoryName || "Design"} — ${payload.name}`,
            customerName: payload.name,
            customerEmail: payload.email,
            categoryName: meta?.categoryName || "Design",
            packageName: meta?.packageName || "Package",
            amount: meta?.amount || valueEstimate,
            status: "brief_submitted",
            paymentStatus: "pending",
            createdAt: now,
            updatedAt: now,
            designerCount: 0,
            revisionLimit:
              String(meta?.packageName || "")
                .toLowerCase()
                .includes("platinum")
                ? 5
                : String(meta?.packageName || "")
                      .toLowerCase()
                      .includes("gold")
                  ? 4
                  : 3,
            revisionsUsed: 0,
            revisions: [],
            messages: [],
            assignedDesignerIds: [],
          },
        ]
      : [];

  if (orders.length) {
    leadNote.body += ` · Order ${orderCode}`;
  }

  return {
    now,
    source,
    lead,
    contact,
    activity,
    leadNote,
    deals,
    orders,
  };
}

function formCrmPatch(payload: LeadFormPayload) {
  const { lead, contact, activity, leadNote, deals, orders } =
    buildLeadPatch(payload);
  return {
    version: 1,
    leads: [lead],
    contacts: [contact],
    activities: [activity, leadNote],
    deals,
    orders,
  };
}

/** Persist via sibling host that already has INTERNAL_API_KEY (www). */
async function persistLeadViaCrmProxy(payload: LeadFormPayload) {
  const { now } = buildLeadPatch(payload);
  const url = crmProxyUrl();
  if (!url) throw new Error("CRM proxy URL is not configured.");

  const currentRes = await fetch(url, { cache: "no-store" });
  const current = (await currentRes.json().catch(() => null)) as {
    ok?: boolean;
    payload?: unknown;
  } | null;

  const base =
    current?.ok && current.payload && typeof current.payload === "object"
      ? (current.payload as Record<string, unknown>)
      : { version: 1 };

  const merged = mergeCrmDocuments(base, formCrmPatch(payload));

  const putRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: merged, updatedAt: now }),
  });
  const putData = (await putRes.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
  } | null;

  if (!putRes.ok || !putData?.ok) {
    throw new Error(putData?.error || `CRM proxy HTTP ${putRes.status}`);
  }
}

/** Write lead + contact + deal/order into the CRM blob admin dashboard reads. */
async function persistLeadToCrm(payload: LeadFormPayload) {
  const { now, source, lead } = buildLeadPatch(payload);

  try {
    await clmCreateLead({
      id: lead.id,
      email: payload.email,
      name: payload.name,
      message: payload.message,
      source,
      status: "new",
      meta: { topic: payload.topic, page: payload.page, form: payload.form },
    });
  } catch {
    /* optional table */
  }

  const current = await clmApiFetch<{
    ok: boolean;
    error?: string;
    payload?: unknown;
    updatedAt?: string | null;
  }>("/crm");

  if (!current.ok) {
    // awsvision deploy has SMTP but no INTERNAL_API_KEY — use www store.
    if (current.error === "INTERNAL_API_KEY is not set") {
      await persistLeadViaCrmProxy(payload);
      return;
    }
    throw new Error(current.error || "Could not read CRM store.");
  }

  const base =
    current.payload && typeof current.payload === "object"
      ? (current.payload as Record<string, unknown>)
      : { version: 1 };

  const merged = mergeCrmDocuments(base, formCrmPatch(payload));

  const saved = await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({
      payload: merged,
      updatedAt: now,
    }),
  });

  if (!saved.ok) {
    throw new Error(saved.error || "Could not save lead to CRM.");
  }
}

async function notifyViaSmtp(payload: LeadFormPayload) {
  await sendSmtpMail({
    to: FORM_NOTIFY_EMAIL,
    replyTo: payload.email,
    subject: notifySubject(payload),
    text: notifyText(payload),
    html: notifyHtml(payload),
  });

  // Thank-you is best-effort — never block admin notify.
  try {
    await sendSmtpMail({
      to: payload.email,
      replyTo: FORM_NOTIFY_EMAIL,
      subject: thankYouSubject(payload.form),
      text: thankYouText(payload),
      html: thankYouHtml(payload),
    });
  } catch {
    /* ignore */
  }

  return true;
}

/** When this host has no SMTP, relay to the awsvision deploy that does. */
async function notifyViaEmailRelay(payload: LeadFormPayload) {
  const url = emailRelayUrl();
  if (!url) throw new Error("Email relay URL is not configured.");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const secret = (process.env.FORM_RELAY_SECRET ?? "").trim();
  if (secret) headers["x-clm-relay-key"] = secret;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Email relay HTTP ${res.status}`);
  }
  return true;
}

/** Last-resort FormSubmit AJAX (often Cloudflare-blocked from servers). */
async function notifyViaFormSubmit(payload: LeadFormPayload) {
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(FORM_NOTIFY_EMAIL)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        form: payload.form,
        topic: payload.topic || payload.form,
        message: payload.message || "(no message)",
        page: payload.page || "",
        _subject: notifySubject(payload),
        _template: "table",
        _replyto: payload.email,
        _captcha: "false",
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `FormSubmit HTTP ${res.status}`);
  }
}

async function notifyViaResend(payload: LeadFormPayload) {
  const apiKey = getResendKey();
  if (!apiKey) return false;
  const resend = new Resend(apiKey);

  const notify = await resend.emails.send({
    from: FORM_FROM_EMAIL,
    to: [FORM_NOTIFY_EMAIL],
    replyTo: payload.email,
    subject: notifySubject(payload),
    text: notifyText(payload),
    html: notifyHtml(payload),
  });
  if (notify.error) throw new Error(notify.error.message);

  await resend.emails.send({
    from: FORM_FROM_EMAIL,
    to: [payload.email],
    replyTo: FORM_NOTIFY_EMAIL,
    subject: thankYouSubject(payload.form),
    text: thankYouText(payload),
    html: thankYouHtml(payload),
  });
  return true;
}

/**
 * POST /api/forms/submit
 * Saves lead to CRM + emails reply@ + thank-you to client.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const payload = normalize(raw);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid name and email." },
      { status: 400 },
    );
  }

  try {
    await persistLeadToCrm(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save your message.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  let emailed = false;
  let emailVia: "smtp" | "resend" | "relay" | "formsubmit" | undefined;
  let emailWarning: string | undefined;

  try {
    if (isSmtpConfigured()) {
      await notifyViaSmtp(payload);
      emailed = true;
      emailVia = "smtp";
    } else if (getResendKey()) {
      emailed = await notifyViaResend(payload);
      emailVia = emailed ? "resend" : undefined;
    } else {
      await notifyViaEmailRelay(payload);
      emailed = true;
      emailVia = "relay";
    }
  } catch (err) {
    emailWarning =
      err instanceof Error ? err.message : "Email notify failed.";
    if (!emailed) {
      try {
        if (!isSmtpConfigured()) {
          await notifyViaEmailRelay(payload);
          emailed = true;
          emailVia = "relay";
          emailWarning = undefined;
        } else if (getResendKey()) {
          emailed = await notifyViaResend(payload);
          emailVia = emailed ? "resend" : emailVia;
          if (emailed) emailWarning = undefined;
        } else {
          await notifyViaFormSubmit(payload);
          emailed = true;
          emailVia = "formsubmit";
          emailWarning = undefined;
        }
      } catch (err2) {
        emailWarning =
          err2 instanceof Error ? err2.message : emailWarning;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    emailed,
    via: emailVia,
    warning: emailWarning,
  });
}
