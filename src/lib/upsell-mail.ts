/** Upsell invoice email copy (SMTP). */

export type UpsellInvoiceMail = {
  customerName: string;
  customerEmail: string;
  orderId: string;
  projectTitle: string;
  upsellTitle: string;
  details: string;
  amount: number;
  currency: string;
  payUrl: string;
  accountUrl: string;
};

function esc(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `$${n.toLocaleString("en-US")}`;
  }
}

export function upsellInvoiceSubject(m: UpsellInvoiceMail) {
  return `Invoice: ${m.upsellTitle} · ${m.orderId}`;
}

export function upsellInvoiceText(m: UpsellInvoiceMail) {
  return [
    `Hi ${m.customerName || "there"},`,
    "",
    `You have a new invoice for project ${m.orderId} (${m.projectTitle}).`,
    "",
    `Item: ${m.upsellTitle}`,
    m.details ? `Details: ${m.details}` : "",
    `Amount due: ${money(m.amount, m.currency)}`,
    "",
    `Pay invoice: ${m.payUrl}`,
    `Your portal: ${m.accountUrl}`,
    "",
    "If you already have an account, the invoice also appears under your project.",
    "",
    "— Creative Logo Makers",
    "https://www.creativelogomakers.com",
  ]
    .filter(Boolean)
    .join("\n");
}

export function upsellInvoiceHtml(m: UpsellInvoiceMail) {
  const amt = money(m.amount, m.currency);
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f2f0;font-family:Georgia,serif;color:#1c1b1a">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2f0;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4e3e0;border-radius:16px;overflow:hidden">
        <tr>
          <td style="background:#1c1b1a;padding:28px 32px">
            <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a8a29e">Creative Logo Makers</p>
            <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:600">Invoice</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.5">Hi ${esc(m.customerName || "there")},</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#57534e">
              A new add-on invoice was added to your project
              <strong style="color:#1c1b1a">${esc(m.orderId)}</strong>
              (${esc(m.projectTitle)}).
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;border:1px solid #e4e3e0;border-radius:12px;margin-bottom:24px">
              <tr>
                <td style="padding:20px 22px">
                  <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#78716c">Item</p>
                  <p style="margin:6px 0 0;font-size:18px;font-weight:600">${esc(m.upsellTitle)}</p>
                  ${
                    m.details
                      ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.55;color:#57534e;white-space:pre-wrap">${esc(m.details)}</p>`
                      : ""
                  }
                  <p style="margin:18px 0 0;font-size:22px;font-weight:700;color:#1c1b1a">${esc(amt)}</p>
                </td>
              </tr>
            </table>
            <a href="${esc(m.payUrl)}" style="display:inline-block;background:#00a581;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 22px;border-radius:999px">Pay invoice</a>
            <p style="margin:18px 0 0;font-size:13px;color:#78716c;line-height:1.5">
              Already signed up?
              <a href="${esc(m.accountUrl)}" style="color:#834692">Open your portal</a>
              — this invoice shows under the project once you log in.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;border-top:1px solid #e4e3e0;font-size:12px;color:#a8a29e">
            creativelogomakers.com · reply@creativelogomakers.com
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
