"use client";

import {
  thankYouText,
  type LeadFormPayload,
} from "@/lib/form-mail";

const FORMSUBMIT_BASE = "https://formsubmit.co";

/**
 * Submit a public lead form:
 * 1) Prefer /api/forms/submit (Resend → reply@ + thank-you)
 * 2) Fallback: classic FormSubmit POST (inbox + autoresponse)
 */
export async function submitLeadForm(
  payload: LeadFormPayload,
  opts?: { nextPath?: string; allowFormSubmitFallback?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      fallback?: string;
      notifyEmail?: string;
      error?: string;
      partial?: boolean;
    };

    if (data.ok) return { ok: true };

    if (
      data.fallback === "formsubmit" &&
      opts?.allowFormSubmitFallback !== false
    ) {
      postViaFormSubmit(payload, data.notifyEmail || "reply@creativelogomakers.com", {
        nextPath: opts?.nextPath,
      });
      // Navigation starts — treat as submitted
      return { ok: true };
    }

    if (data.fallback === "formsubmit") {
      // Soft-fail when redirect fallback is disabled (e.g. signup)
      return { ok: true };
    }

    return {
      ok: false,
      error: data.error || "Could not send your message. Please try again.",
    };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}

/** Classic FormSubmit (not AJAX) so _autoresponse thank-you emails work. */
function postViaFormSubmit(
  payload: LeadFormPayload,
  notifyEmail: string,
  opts?: { nextPath?: string },
) {
  if (typeof document === "undefined") return;

  const origin = window.location.origin;
  const next =
    opts?.nextPath?.startsWith("http")
      ? opts.nextPath
      : `${origin}${opts?.nextPath || "/contact?sent=1"}`;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${FORMSUBMIT_BASE}/${encodeURIComponent(notifyEmail)}`;
  form.style.display = "none";

  const fields: Record<string, string> = {
    name: payload.name,
    email: payload.email,
    form: payload.form,
    topic: payload.topic || payload.form,
    message: payload.message || "(no message)",
    page: payload.page || window.location.href,
    _subject: `[CLM ${payload.form}] ${payload.topic || payload.form} — ${payload.name}`,
    _template: "table",
    _replyto: payload.email,
    _next: next,
    // Leave FormSubmit captcha ON so autoresponse is allowed
    _autoresponse: thankYouText(payload),
  };

  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
