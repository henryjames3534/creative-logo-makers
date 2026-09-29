/** Inbox for all public lead / contact forms */
export const FORM_NOTIFY_EMAIL =
  (process.env.FORM_NOTIFY_EMAIL ?? "reply@creativelogomakers.com").trim();

export const FORM_FROM_EMAIL = (
  process.env.FORM_FROM_EMAIL ??
  "Creative Logo Makers <onboarding@resend.dev>"
).trim();

export type LeadFormType = "contact" | "studio" | "signup";

export type LeadFormPayload = {
  form: LeadFormType;
  name: string;
  email: string;
  topic?: string;
  message?: string;
  page?: string;
};

export function thankYouSubject(form: LeadFormType) {
  if (form === "studio") {
    return "Thanks — we received your Studio request";
  }
  if (form === "signup") {
    return "Welcome to Creative Logo Makers";
  }
  return "Thanks — we received your message";
}

export function thankYouText(payload: LeadFormPayload) {
  const first = payload.name.trim().split(/\s+/)[0] || "there";
  if (payload.form === "studio") {
    return [
      `Hi ${first},`,
      "",
      "Thanks for requesting a Studio call with Creative Logo Makers.",
      "A Brand Strategist will follow up within one business day.",
      "",
      "If anything is urgent, reply to this email or write to reply@creativelogomakers.com.",
      "",
      "— Creative Logo Makers",
      "https://www.creativelogomakers.com",
    ].join("\n");
  }
  if (payload.form === "signup") {
    return [
      `Hi ${first},`,
      "",
      "Welcome to Creative Logo Makers — your account is ready.",
      "You can launch contests, hire designers, and track updates from your account dashboard.",
      "",
      "Questions? Reply to this email or contact reply@creativelogomakers.com.",
      "",
      "— Creative Logo Makers",
      "https://www.creativelogomakers.com",
    ].join("\n");
  }
  return [
    `Hi ${first},`,
    "",
    "Thanks for contacting Creative Logo Makers. We received your message and will reply within one business day.",
    "",
    "If you need help sooner, reply to this email or write to reply@creativelogomakers.com.",
    "",
    "— Creative Logo Makers",
    "https://www.creativelogomakers.com",
  ].join("\n");
}

export function notifySubject(payload: LeadFormPayload) {
  const topic = payload.topic?.trim() || payload.form;
  return `[CLM ${payload.form}] ${topic} — ${payload.name}`;
}

export function notifyText(payload: LeadFormPayload) {
  return [
    `New ${payload.form} form submission`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.topic ? `Topic: ${payload.topic}` : null,
    payload.page ? `Page: ${payload.page}` : null,
    "",
    "Message:",
    payload.message?.trim() || "(none)",
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function thankYouHtml(payload: LeadFormPayload) {
  return `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;line-height:1.5">${escapeHtml(
    thankYouText(payload),
  )}</pre>`;
}

export function notifyHtml(payload: LeadFormPayload) {
  return `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;line-height:1.5">${escapeHtml(
    notifyText(payload),
  )}</pre>`;
}
