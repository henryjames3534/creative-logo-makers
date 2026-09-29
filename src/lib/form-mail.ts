/** Inbox for all public lead / contact forms */
export const FORM_NOTIFY_EMAIL =
  (process.env.FORM_NOTIFY_EMAIL ?? "reply@creativelogomakers.com").trim();

export const FORM_FROM_EMAIL = (
  process.env.FORM_FROM_EMAIL ??
  process.env.SMTP_FROM ??
  "Creative Logo Makers <reply@creativelogomakers.com>"
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
    return "Thanks — we received your Studio request | Creative Logo Makers";
  }
  if (form === "signup") {
    return "Welcome to Creative Logo Makers";
  }
  return "Thanks — we received your message | Creative Logo Makers";
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

function emailShell(opts: {
  eyebrow: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:28px 0 0">
          <a href="${escapeHtml(opts.ctaHref)}"
             style="display:inline-block;background:#00a581;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">
            ${escapeHtml(opts.ctaLabel)}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f2f0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#313030">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2f0;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e3e0">
          <tr>
            <td style="background:#834692;padding:22px 28px">
              <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-weight:700">${escapeHtml(opts.eyebrow)}</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff">${escapeHtml(opts.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px">
              ${opts.bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#faf9f7;border-top:1px solid #e4e3e0;font-size:12px;color:#6b6a68;line-height:1.5">
              Creative Logo Makers ·
              <a href="https://www.creativelogomakers.com" style="color:#834692;text-decoration:none">creativelogomakers.com</a>
              · reply@creativelogomakers.com
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function thankYouHtml(payload: LeadFormPayload) {
  const first = escapeHtml(payload.name.trim().split(/\s+/)[0] || "there");
  let bodyHtml = "";
  let title = "We got your message";
  let ctaLabel = "Visit our site";
  let ctaHref = "https://www.creativelogomakers.com";

  if (payload.form === "studio") {
    title = "Studio request received";
    bodyHtml = `
      <p style="margin:0 0 14px;font-size:16px;line-height:1.6">Hi ${first},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4b4a48">
        Thanks for requesting a Studio call with Creative Logo Makers.
        A Brand Strategist will follow up within <strong>one business day</strong>.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#4b4a48">
        Need something sooner? Just reply to this email.
      </p>`;
    ctaLabel = "Explore Studio";
    ctaHref = "https://www.creativelogomakers.com/studio";
  } else if (payload.form === "signup") {
    title = "Welcome aboard";
    bodyHtml = `
      <p style="margin:0 0 14px;font-size:16px;line-height:1.6">Hi ${first},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4b4a48">
        Welcome to Creative Logo Makers — your account is ready.
        Launch contests, hire designers, and track project updates from your dashboard.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#4b4a48">
        Questions? Reply to this email anytime.
      </p>`;
    ctaLabel = "Open your account";
    ctaHref = "https://www.creativelogomakers.com/account";
  } else {
    bodyHtml = `
      <p style="margin:0 0 14px;font-size:16px;line-height:1.6">Hi ${first},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4b4a48">
        Thanks for contacting Creative Logo Makers. We received your message and will reply within
        <strong>one business day</strong>.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#4b4a48">
        If you need help sooner, reply to this email or write to reply@creativelogomakers.com.
      </p>`;
  }

  return emailShell({
    eyebrow: "Creative Logo Makers",
    title,
    bodyHtml,
    ctaLabel,
    ctaHref,
  });
}

export function notifyHtml(payload: LeadFormPayload) {
  const rows = [
    ["Form", payload.form],
    ["Name", payload.name],
    ["Email", payload.email],
    payload.topic ? ["Topic", payload.topic] : null,
    payload.page ? ["Page", payload.page] : null,
    ["Message", payload.message?.trim() || "(none)"],
  ].filter(Boolean) as [string, string][];

  const table = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px;font-weight:700;color:#6b6a68;width:110px;vertical-align:top">${escapeHtml(k)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;color:#313030;white-space:pre-wrap">${escapeHtml(v)}</td>
      </tr>`,
    )
    .join("");

  return emailShell({
    eyebrow: "New lead",
    title: notifySubject(payload),
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#4b4a48">
        A new form submission was saved to the admin CRM and emailed here.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e4e3e0;border-radius:12px;overflow:hidden">
        ${table}
      </table>`,
    ctaLabel: "Open admin leads",
    ctaHref: "https://www.creativelogomakers.com/admin/leads",
  });
}
