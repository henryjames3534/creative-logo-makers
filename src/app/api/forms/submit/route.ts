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

const ALLOWED: LeadFormType[] = ["contact", "studio", "signup"];

function getResendKey() {
  return (process.env.RESEND_API_KEY ?? "").trim();
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
  return "Signup";
}

/** Write lead + visitor into the CRM blob admin dashboard reads. */
async function persistLeadToCrm(payload: LeadFormPayload) {
  const now = new Date().toISOString();
  const source = sourceLabel(payload.form);

  const lead = {
    id: uid("ld"),
    name: payload.name,
    email: payload.email,
    source,
    status: "new",
    score: payload.form === "studio" ? 70 : 55,
    interest: payload.topic || payload.form,
    valueEstimate: payload.form === "studio" ? 999 : 499,
    ownerId: "own_admin",
    notes: [payload.message || "", payload.page ? `Page: ${payload.page}` : ""]
      .filter(Boolean)
      .join("\n"),
    createdAt: now,
    updatedAt: now,
  };

  const visitor = {
    id: uid("vis"),
    visitorKey: uid("vk"),
    email: payload.email,
    name: payload.name,
    source: payload.form === "signup" ? "signup_form" : "manual",
    signedIn: payload.form === "signup",
    firstSeenAt: now,
    lastSeenAt: now,
    path: payload.page || "/",
    hits: 1,
    visitCount: 1,
    totalDurationMs: 0,
    pageViews: [],
    sessions: [],
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
    payload?: unknown;
    updatedAt?: string | null;
  }>("/crm");

  const base =
    current.ok && current.payload && typeof current.payload === "object"
      ? (current.payload as Record<string, unknown>)
      : { version: 1 };

  const patch = {
    version: 1,
    leads: [lead],
    visitors: [visitor],
    activities: [activity],
  };

  const merged = mergeCrmDocuments(base, patch);
  await clmApiFetch("/crm", {
    method: "PUT",
    body: JSON.stringify({
      payload: merged,
      updatedAt: now,
    }),
  });
}

async function notifyViaSmtp(payload: LeadFormPayload) {
  await sendSmtpMail({
    to: FORM_NOTIFY_EMAIL,
    replyTo: payload.email,
    subject: notifySubject(payload),
    text: notifyText(payload),
    html: notifyHtml(payload),
  });

  await sendSmtpMail({
    to: payload.email,
    replyTo: FORM_NOTIFY_EMAIL,
    subject: thankYouSubject(payload.form),
    text: thankYouText(payload),
    html: thankYouHtml(payload),
  });

  return true;
}

/** Fallback if SMTP is down — FormSubmit AJAX (no browser redirect). */
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
  let emailVia: "smtp" | "resend" | "formsubmit" | undefined;
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
      await notifyViaFormSubmit(payload);
      emailed = true;
      emailVia = "formsubmit";
    }
  } catch (err) {
    emailWarning =
      err instanceof Error ? err.message : "Email notify failed.";
    // Last-resort fallbacks so lead email still reaches inbox when possible
    if (!emailed) {
      try {
        if (isSmtpConfigured() && emailVia !== "smtp") {
          /* already failed smtp */
        } else if (getResendKey()) {
          emailed = await notifyViaResend(payload);
          emailVia = emailed ? "resend" : emailVia;
          emailWarning = undefined;
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
