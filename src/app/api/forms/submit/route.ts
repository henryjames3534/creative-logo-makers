import { NextResponse } from "next/server";
import { Resend } from "resend";
import { clmCreateLead } from "@/lib/clm-api";
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

export const runtime = "nodejs";

const ALLOWED: LeadFormType[] = ["contact", "studio", "signup"];

function getResendKey() {
  return (process.env.RESEND_API_KEY ?? "").trim();
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

async function persistLead(payload: LeadFormPayload) {
  try {
    await clmCreateLead({
      email: payload.email,
      name: payload.name,
      message: payload.message,
      source:
        payload.form === "contact"
          ? "Contact form"
          : payload.form === "studio"
            ? "Studio form"
            : "Signup",
      status: "new",
      meta: {
        topic: payload.topic,
        page: payload.page,
        form: payload.form,
      },
    });
  } catch {
    /* bridge optional */
  }
}

/**
 * POST /api/forms/submit
 * Sends inbox notification → reply@creativelogomakers.com
 * and a thank-you email to the person who submitted.
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

  void persistLead(payload);

  const apiKey = getResendKey();
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      fallback: "formsubmit",
      notifyEmail: FORM_NOTIFY_EMAIL,
    });
  }

  const resend = new Resend(apiKey);

  try {
    const notify = await resend.emails.send({
      from: FORM_FROM_EMAIL,
      to: [FORM_NOTIFY_EMAIL],
      replyTo: payload.email,
      subject: notifySubject(payload),
      text: notifyText(payload),
      html: notifyHtml(payload),
    });
    if (notify.error) {
      return NextResponse.json(
        { ok: false, error: notify.error.message || "Could not notify inbox." },
        { status: 502 },
      );
    }

    const thanks = await resend.emails.send({
      from: FORM_FROM_EMAIL,
      to: [payload.email],
      replyTo: FORM_NOTIFY_EMAIL,
      subject: thankYouSubject(payload.form),
      text: thankYouText(payload),
      html: thankYouHtml(payload),
    });
    if (thanks.error) {
      return NextResponse.json({
        ok: true,
        partial: true,
        warning: thanks.error.message || "Thank-you email failed.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Email service unavailable.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
