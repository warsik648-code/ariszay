/**
 * Email provider abstraction.
 * Configure via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * When SMTP_HOST is not set (development), emails are logged to the console.
 * In production, set the variables to use your SMTP provider (Resend, Mailgun, etc.).
 */

import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = { success: true } | { success: false; error: string };

export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  // Dev fallback: log to console if no SMTP configured
  if (!SMTP_HOST) {
    console.log("📧 [dev email — no SMTP configured]");
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body (text): ${options.text ?? "(html only)"}`);
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });

    await transporter.sendMail({
      from: SMTP_FROM ?? "noreply@example.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true };
  } catch (err) {
    console.error("[email] Send failed:", err);
    return { success: false, error: "Email delivery failed" };
  }
}
