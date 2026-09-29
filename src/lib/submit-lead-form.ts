"use client";

import type { LeadFormPayload } from "@/lib/form-mail";

/**
 * Submit a public lead form via /api/forms/submit.
 * Server saves CRM lead + emails reply@ — no browser redirect.
 */
export async function submitLeadForm(
  payload: LeadFormPayload,
  _opts?: { nextPath?: string; allowFormSubmitFallback?: boolean },
): Promise<{ ok: true; warning?: string } | { ok: false; error: string }> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);

    const res = await fetch("/api/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => window.clearTimeout(timer));

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      warning?: string;
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || "Could not send your message. Please try again.",
      };
    }

    return { ok: true, warning: data.warning };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        error: "Request timed out. Please try again.",
      };
    }
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
