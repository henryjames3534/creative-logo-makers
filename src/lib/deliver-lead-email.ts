import { Resend } from "resend";
import {
  FORM_FROM_EMAIL,
  FORM_NOTIFY_EMAIL,
  FORM_NOTIFY_EMAILS,
  notifyHtml,
  notifySubject,
  notifyText,
  thankYouHtml,
  thankYouSubject,
  thankYouText,
  type LeadFormPayload,
} from "@/lib/form-mail";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/smtp-mail";

const DEFAULT_EMAIL_RELAY =
  "https://creative-logo-makers-lovat.vercel.app/api/forms/email";

export type EmailVia = "smtp" | "resend" | "relay" | "formsubmit";

function getResendKey() {
  return (process.env.RESEND_API_KEY ?? "").trim();
}

function emailRelayUrl() {
  return (process.env.FORM_EMAIL_RELAY_URL ?? DEFAULT_EMAIL_RELAY).trim();
}

async function notifyViaSmtp(payload: LeadFormPayload) {
  await sendSmtpMail({
    to: FORM_NOTIFY_EMAILS,
    replyTo: payload.email,
    subject: notifySubject(payload),
    text: notifyText(payload),
    html: notifyHtml(payload),
  });

  try {
    await sendSmtpMail({
      to: payload.email,
      replyTo: FORM_NOTIFY_EMAIL,
      subject: thankYouSubject(payload.form),
      text: thankYouText(payload),
      html: thankYouHtml(payload),
    });
  } catch {
    /* thank-you best-effort */
  }
}

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
}

async function notifyViaFormSubmit(payload: LeadFormPayload) {
  const errors: string[] = [];
  let anyOk = false;
  for (const inbox of FORM_NOTIFY_EMAILS) {
    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`,
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
      const text = await res.text().catch(() => "");
      if (!res.ok) {
        throw new Error(text || `FormSubmit HTTP ${res.status}`);
      }
      try {
        const data = JSON.parse(text) as { success?: string; message?: string };
        if (data.message && !data.success) {
          throw new Error(data.message);
        }
      } catch (err) {
        if (!(err instanceof SyntaxError)) throw err;
      }
      anyOk = true;
    } catch (err) {
      errors.push(
        `${inbox}: ${err instanceof Error ? err.message : "failed"}`,
      );
    }
  }
  if (!anyOk) {
    throw new Error(errors.join(" | ") || "FormSubmit failed for all inboxes.");
  }
}

async function notifyViaResend(payload: LeadFormPayload) {
  const apiKey = getResendKey();
  if (!apiKey) throw new Error("Resend API key is not configured.");
  const resend = new Resend(apiKey);

  const notify = await resend.emails.send({
    from: FORM_FROM_EMAIL,
    to: FORM_NOTIFY_EMAILS,
    replyTo: payload.email,
    subject: notifySubject(payload),
    text: notifyText(payload),
    html: notifyHtml(payload),
  });
  if (notify.error) throw new Error(notify.error.message);

  try {
    await resend.emails.send({
      from: FORM_FROM_EMAIL,
      to: [payload.email],
      replyTo: FORM_NOTIFY_EMAIL,
      subject: thankYouSubject(payload.form),
      text: thankYouText(payload),
      html: thankYouHtml(payload),
    });
  } catch {
    /* thank-you best-effort */
  }
}

/**
 * Admin email MUST work even when Postgres / CRM is down.
 * Tries smtp → resend → relay → formsubmit until one succeeds.
 */
export async function deliverAdminEmail(payload: LeadFormPayload): Promise<{
  emailed: boolean;
  via?: EmailVia;
  error?: string;
}> {
  const attempts: Array<{
    via: EmailVia;
    ready: boolean;
    run: () => Promise<unknown>;
  }> = [
    {
      via: "smtp",
      ready: isSmtpConfigured(),
      run: () => notifyViaSmtp(payload),
    },
    {
      via: "resend",
      ready: Boolean(getResendKey()),
      run: () => notifyViaResend(payload),
    },
    {
      via: "relay",
      ready: Boolean(emailRelayUrl()),
      run: () => notifyViaEmailRelay(payload),
    },
    {
      via: "formsubmit",
      ready: true,
      run: () => notifyViaFormSubmit(payload),
    },
  ];

  const errors: string[] = [];
  for (const step of attempts) {
    if (!step.ready) continue;
    try {
      await step.run();
      return { emailed: true, via: step.via };
    } catch (err) {
      errors.push(
        `${step.via}: ${err instanceof Error ? err.message : "failed"}`,
      );
    }
  }

  return {
    emailed: false,
    error: errors.join(" | ") || "No email channel available.",
  };
}
