"use client";

import { captureVisitorEmail } from "@/lib/capture-visitor";
import {
  upsertContact,
  upsertLead,
  type VisitorSource,
} from "@/lib/crm-storage";
import type { LeadFormPayload } from "@/lib/form-mail";

/**
 * Optimistic local CRM for form fills — leads/contacts only.
 * Orders + pipeline deals are created ONCE by /api/forms/submit
 * (or /api/crm/fulfill after payment). Do not upsertOrder here or
 * the same brief becomes two projects.
 */
export function captureFormLead(payload: LeadFormPayload) {
  if (typeof window === "undefined") return;
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim() || email.split("@")[0];
  if (!email) return;

  const sourceLabel =
    payload.form === "contact"
      ? "Contact form"
      : payload.form === "studio"
        ? "Studio form"
        : payload.form === "package"
          ? "Package brief"
          : "Signup";

  const source: VisitorSource =
    payload.form === "signup" ? "signup_form" : "manual";

  const valueEstimate =
    payload.form === "studio" ? 999 : payload.form === "package" ? 699 : 499;

  const notes = [
    payload.message?.trim() || "",
    payload.page ? `Page: ${payload.page}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    upsertContact({
      name,
      email,
      title: payload.form === "package" ? "Customer" : undefined,
      tags: [
        payload.form,
        payload.form === "package" ? "package-brief" : "website-form",
      ],
    });
  } catch {
    /* ignore */
  }

  try {
    upsertLead({
      name,
      email,
      source: sourceLabel,
      interest: payload.topic || payload.form,
      notes,
      score:
        payload.form === "studio" ? 70 : payload.form === "package" ? 80 : 55,
      status: "new",
      valueEstimate,
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
