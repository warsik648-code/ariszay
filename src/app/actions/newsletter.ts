"use server";

import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function subscribeNewsletter(
  formData: FormData,
): Promise<NewsletterResult> {
  const raw = { email: formData.get("email") };
  const parsed = newsletterSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // TODO: Connect to an email provider (Mailchimp, ConvertKit, etc.)
  // For now, log the signup and return success.
  console.log("[newsletter] New signup:", parsed.data.email);

  return {
    success: true,
    message: "You're subscribed. We'll notify you of product updates.",
  };
}
