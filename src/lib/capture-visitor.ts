"use client";

/**
 * Capture emails into Leads/Contacts only — never into Visitors.
 * Visitors are anonymous IP/session traffic from VisitorTracker.
 */
import { notifyVisitorCaptured } from "@/components/analytics/VisitorCaptureToast";
import {
  isStaffBrowser,
  isStaffEmail,
  upsertContact,
  upsertLead,
} from "@/lib/crm-storage";
import type { VisitorSource } from "@/lib/crm-storage";

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

  try {
    upsertLead({
      name,
      email,
      source:
        input.source === "google_onetap" || input.source === "google_button"
          ? "Google"
          : input.source === "login_form"
            ? "Login form"
            : input.source === "signup_form"
              ? "Signup form"
              : input.source === "portal"
                ? "Customer portal"
                : "Visitor email",
      interest: "Email captured on site",
      notes: `Captured via ${input.source.replace(/_/g, " ")}${path ? ` · ${path}` : ""}`,
      score: input.source.startsWith("google") ? 70 : 50,
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
