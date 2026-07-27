import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth (Better Auth)
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),

  // First admin account (for seeding only)
  SEED_ADMIN_EMAIL: z.email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
  SEED_ADMIN_NAME: z.string().optional(),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.email().optional().default("noreply@example.com"),
});

const clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!clientEnv.success) {
  console.error(
    "❌ Invalid client environment variables:",
    clientEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid client environment variables");
}

function getServerEnv() {
  if (typeof window !== "undefined") return {} as z.infer<typeof serverSchema>;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid server environment variables");
  }
  return parsed.data;
}

export const env = {
  ...clientEnv.data,
  ...getServerEnv(),
};

export type Env = typeof env;
