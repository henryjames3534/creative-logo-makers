"use client";

/**
 * Capture visitor emails into CRM (admin /visitors + leads)
 * as soon as Google JWT or a typed email is available —
 * does not require completing sign-in.
 */
import { trackVisitor, type VisitorSource } from "@/lib/crm-storage";
import { notifyVisitorCaptured } from "@/components/analytics/VisitorCaptureToast";

const VID_KEY = "clm_visitor_key";

function visitorKey() {
  try {
    let k = localStorage.getItem(VID_KEY);
    if (!k) {
      k = `vk_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      localStorage.setItem(VID_KEY, k);
    }
    return k;
  } catch {
    return undefined;
  }
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
  const email = input.email?.trim();
  if (!email) return;
  try {
    trackVisitor({
      email,
      visitorKey: visitorKey(),
      name: input.name,
      picture: input.picture,
      source: input.source,
      signedIn: input.signedIn,
      path: window.location.pathname,
      createLead: true,
      userAgent: navigator.userAgent,
      language: navigator.language,
    });
    if (!input.silent) notifyVisitorCaptured(email.toLowerCase(), input.name);
  } catch {
    /* ignore storage errors */
  }
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
