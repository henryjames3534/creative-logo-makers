"use client";

import { captureVisitorEmail } from "@/lib/capture-visitor";
import { upsertLead, type VisitorSource } from "@/lib/crm-storage";
import type { LeadFormPayload } from "@/lib/form-mail";

/** Persist a public form fill into admin CRM (leads + visitors). */
export function captureFormLead(payload: LeadFormPayload) {
  if (typeof window === "undefined") return;
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim() || email.split("@")[0];
  if (!email) return;

  const source: VisitorSource =
    payload.form === "signup" ? "signup_form" : "manual";

  try {
    upsertLead({
      name,
      email,
      source:
        payload.form === "contact"
          ? "Contact form"
          : payload.form === "studio"
            ? "Studio form"
            : payload.form === "package"
              ? "Package brief"
              : "Signup",
      interest: payload.topic || payload.form,
      notes: [
        payload.message?.trim() || "",
        payload.page ? `Page: ${payload.page}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      score:
        payload.form === "studio" ? 70 : payload.form === "package" ? 80 : 55,
      status: "new",
      valueEstimate:
        payload.form === "studio"
          ? 999
          : payload.form === "package"
            ? 699
            : 499,
    });
  } catch {
    /* ignore */
  }

  try {
    captureVisitorEmail({
      email,
      name,
      source,
      signedIn: payload.form === "signup",
      silent: true,
    });
  } catch {
    /* ignore */
  }
}
