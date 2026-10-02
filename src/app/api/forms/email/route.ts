import { NextResponse } from "next/server";
import {
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
import { isSmtpConfigured, sendSmtpMail } from "@/lib/smtp-mail";

export const runtime = "nodejs";

const ALLOWED: LeadFormType[] = ["contact", "studio", "signup", "package"];

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

function relayAuthorized(req: Request) {
  const expected = (process.env.FORM_RELAY_SECRET ?? "").trim();
  if (!expected) return true;
  const got = (req.headers.get("x-clm-relay-key") ?? "").trim();
  return got === expected;
}

/**
 * POST /api/forms/email
 * SMTP-only notify (+ thank-you). Used as a relay when the primary host
 * (www) has CRM keys but no SMTP env vars.
 */
export async function POST(req: Request) {
  if (!relayAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { ok: false, error: "SMTP is not configured on this host." },
      { status: 503 },
    );
  }

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
    await sendSmtpMail({
      to: FORM_NOTIFY_EMAIL,
      replyTo: payload.email,
      subject: notifySubject(payload),
      text: notifyText(payload),
      html: notifyHtml(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notify failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  let thankYou = true;
  try {
    await sendSmtpMail({
      to: payload.email,
      replyTo: FORM_NOTIFY_EMAIL,
      subject: thankYouSubject(payload.form),
      text: thankYouText(payload),
      html: thankYouHtml(payload),
    });
  } catch {
    thankYou = false;
  }

  return NextResponse.json({ ok: true, emailed: true, via: "smtp", thankYou });
}
