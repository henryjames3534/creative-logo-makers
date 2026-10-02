"use client";

/**
 * Capture emails into Contacts (and real form leads only).
 * Google One Tap / remembered logins do NOT create Leads —
 * those were flooding admin with staff & casual "Site visit" junk.
 */
import { notifyVisitorCaptured } from "@/components/analytics/VisitorCaptureToast";
import {
  isStaffBrowser,
  isStaffEmail,
  upsertContact,
  upsertLead,
} from "@/lib/crm-storage";
import type { VisitorSource } from "@/lib/crm-storage";

/** Sources that mean a real intent to become a lead */
function shouldCreateLead(source: VisitorSource) {
  return (
    source === "login_form" ||
    source === "signup_form" ||
    source === "portal"
  );
}

export function captureVisitorEmail(input: {
  email: string;
  name?: string;
  picture?: string;
  source: VisitorSource;
  signedIn?: boolean;
  silent?: boolean;
}) {
  if (typeof window === "undefined") return;
  const email = input.email?.trim().toLowerCase();
  if (!email) return;
  if (isStaffBrowser() || isStaffEmail(email)) return;
  const path = window.location.pathname;
  if (path.startsWith("/admin") || path.startsWith("/designer")) return;

  const name =
    input.name?.trim() || email.split("@")[0] || "Website visitor";

  try {
    upsertContact({
      name,
      email,
      title: input.signedIn ? "Signed-in customer" : "Email captured",
      tags: ["email-capture", input.source],
    });
  } catch {
    /* ignore */
  }

  // Google One Tap / remembered / button → contact only, not a lead
  if (!shouldCreateLead(input.source)) {
    if (!input.silent) notifyVisitorCaptured(email, input.name);
    return;
  }

  try {
    upsertLead({
      name,
      email,
      source:
        input.source === "login_form"
          ? "Login form"
          : input.source === "signup_form"
            ? "Signup form"
            : "Customer portal",
      interest: "Email captured on site",
      notes: `Captured via ${input.source.replace(/_/g, " ")}${path ? ` · ${path}` : ""}`,
      score: 50,
      status: "new",
      valueEstimate: 299,
    });
  } catch {
    /* ignore */
  }

  if (!input.silent) notifyVisitorCaptured(email, input.name);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Debounced capture while user types an email (login/signup). */
export function captureTypedEmail(
  email: string,
  source: "login_form" | "signup_form",
  name?: string,
) {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return;
  captureVisitorEmail({ email: e, name, source, signedIn: false });
}
