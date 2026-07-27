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

export function ticketCreatedEmail(opts: {
  name: string;
  ticketNumber: string;
  orderNumber: string;
  productSummary: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/account/tickets/${opts.ticketNumber}`;
  return {
    subject: `Support ticket created — ${opts.ticketNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Your support ticket has been created</h1>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Hi ${opts.name}, ticket <strong style="color:#fff;">${opts.ticketNumber}</strong> is linked to order ${opts.orderNumber}.
      </p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);line-height:1.6;">Products: ${opts.productSummary || "—"}</p>
      <a href="${url}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Open ticket
      </a>
    `),
    text: `Ticket ${opts.ticketNumber} created for order ${opts.orderNumber}.\nOpen: ${url}`,
  };
}

export function staffReplyEmail(opts: {
  name: string;
  ticketNumber: string;
  preview: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/account/tickets/${opts.ticketNumber}`;
  return {
    subject: `Staff replied — ${opts.ticketNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Staff reply on ${opts.ticketNumber}</h1>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">Hi ${opts.name},</p>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.7);line-height:1.6;">${opts.preview}</p>
      <a href="${url}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        View conversation
      </a>
    `),
    text: `Staff replied on ${opts.ticketNumber}:\n${opts.preview}\n\n${url}`,
  };
}

export function newTicketStaffEmail(opts: {
  ticketNumber: string;
  orderNumber: string;
  customerEmail: string;
  category: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/tickets/${opts.ticketNumber}`;
  return {
    subject: `[Ops] New ticket ${opts.ticketNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">New support ticket</h1>
      <p style="margin:0;color:rgba(255,255,255,0.6);line-height:1.6;">
        ${opts.ticketNumber} · ${opts.category}<br/>
        Order: ${opts.orderNumber}<br/>
        Customer: ${opts.customerEmail}
      </p>
      <p style="margin:24px 0 0;"><a href="${url}" style="color:#c8ff00;">Open in Operations Center</a></p>
    `),
    text: `New ticket ${opts.ticketNumber} (${opts.category}) order ${opts.orderNumber} — ${opts.customerEmail}\n${url}`,
  };
}

export function refundUpdatedEmail(opts: {
  name: string;
  orderNumber: string;
  status: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/account/refunds`;
  return {
    subject: `Refund ${opts.status.toLowerCase()} — ${opts.orderNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Refund update</h1>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Hi ${opts.name}, your refund for order ${opts.orderNumber} is now <strong style="color:#fff;">${opts.status}</strong>.
      </p>
      <a href="${url}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        Track refund
      </a>
    `),
    text: `Refund for ${opts.orderNumber} is now ${opts.status}.\n${url}`,
  };
}

export function refundRequestStaffEmail(opts: {
  orderNumber: string;
  customerEmail: string;
  reason: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/refunds`;
  return {
    subject: `[Ops] Refund request — ${opts.orderNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Refund request</h1>
      <p style="margin:0;color:rgba(255,255,255,0.6);line-height:1.6;">
        Order ${opts.orderNumber}<br/>
        Customer: ${opts.customerEmail}<br/>
        Reason: ${opts.reason}
      </p>
      <p style="margin:24px 0 0;"><a href="${url}" style="color:#c8ff00;">Review refunds</a></p>
    `),
    text: `Refund request ${opts.orderNumber} from ${opts.customerEmail}: ${opts.reason}\n${url}`,
  };
}

export function orderCreatedEmail(opts: {
  name: string;
  orderNumber: string;
  total: number;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${opts.orderNumber}`;
  return {
    subject: `Order created — ${opts.orderNumber}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Order ${opts.orderNumber}</h1>
      <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);line-height:1.6;">
        Hi ${opts.name}, your order totaling $${opts.total.toFixed(2)} is in Mission Control.
      </p>
      <a href="${url}" style="display:inline-block;background:#c8ff00;color:#0a0a0a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
        View order
      </a>
    `),
    text: `Order ${opts.orderNumber} created ($${opts.total.toFixed(2)}).\n${url}`,
  };
}
