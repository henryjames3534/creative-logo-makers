import nodemailer from "nodemailer";

export type SmtpSendInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function smtpConfigured() {
  return Boolean(
    (process.env.SMTP_HOST ?? "").trim() &&
      (process.env.SMTP_USER ?? "").trim() &&
      (process.env.SMTP_PASS ?? "").trim(),
  );
}

export function isSmtpConfigured() {
  return smtpConfigured();
}

function fromAddress() {
  return (
    process.env.SMTP_FROM ??
    process.env.FORM_FROM_EMAIL ??
    `Creative Logo Makers <${process.env.SMTP_USER || "reply@creativelogomakers.com"}>`
  ).trim();
}

function createTransport() {
  const host = (process.env.SMTP_HOST ?? "mail.creativelogomakers.com").trim();
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = (process.env.SMTP_USER ?? "").trim();
  const pass = process.env.SMTP_PASS ?? "";
  const secure =
    (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")).toLowerCase() !==
    "false";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendSmtpMail(input: SmtpSendInput) {
  if (!smtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }
  const transport = createTransport();
  const info = await transport.sendMail({
    from: fromAddress(),
    to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return info;
}
