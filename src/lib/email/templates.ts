/**
 * Transactional email templates.
 * All templates return { subject, html, text } ready to pass to sendEmail().
 */

const BRAND = "ArisZay";

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:system-ui,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px;">
        <tr><td>
          <p style="margin:0 0 32px;font-size:20px;font-weight:bold;color:#fff;">
            Aris<span style="color:#6366f1;">Zay</span>
          </p>
          ${body}
          <p style="margin:32px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">
            © ${new Date().getFullYear()} ${BRAND}. This is an automated email — please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${BRAND}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#fff;">Welcome, ${name}!</h1>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Your account has been created. You can now sign in and view your orders.
      </p>
      <p style="margin:0;color:rgba(255,255,255,0.6);line-height:1.6;">
        If you did not create this account, please ignore this email.
      </p>
    `),
    text: `Welcome to ${BRAND}, ${name}!\n\nYour account has been created. Sign in at ${process.env.NEXT_PUBLIC_SITE_URL}/auth/sign-in`,
  };
}

export function orderConfirmationEmail(opts: {
  name: string;
  orderId: string;
  items: { name: string; plan: string; price: number }[];
  total: number;
}) {
  const itemRows = opts.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:rgba(255,255,255,0.7);">${item.name}</td>
          <td style="padding:8px 0;color:rgba(255,255,255,0.5);">${item.plan}</td>
          <td style="padding:8px 0;text-align:right;color:#fff;">$${item.price.toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  return {
    subject: `Order Confirmed — #${opts.orderId.slice(-8).toUpperCase()}`,
    html: layout(`
      <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Order received</h1>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:13px;">Order #${opts.orderId.slice(-8).toUpperCase()}</p>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Hi ${opts.name}, your payment has been confirmed. Setup instructions will follow shortly.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);">
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:12px 0;font-weight:bold;color:#fff;">Total</td>
          <td style="padding:12px 0;text-align:right;font-weight:bold;color:#fff;">$${opts.total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin:0;color:rgba(255,255,255,0.6);line-height:1.6;">
        Check your account dashboard to view order details and delivery instructions.
      </p>
    `),
    text: `Order confirmed — #${opts.orderId.slice(-8).toUpperCase()}\n\nHi ${opts.name}, your payment has been confirmed.\nTotal: $${opts.total.toFixed(2)}`,
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: `Reset your ${BRAND} password`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Password reset</h1>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Click the button below to reset your password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;font-size:14px;">
        Reset password
      </a>
      <p style="margin:24px 0 0;color:rgba(255,255,255,0.3);font-size:13px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `),
    text: `Reset your ${BRAND} password\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  };
}
