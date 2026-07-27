import { z } from "zod";

/**
 * Client-exposed env vars must be prefixed with NEXT_PUBLIC_.
 * Only values that are safe to ship to the browser belong here.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .describe("Canonical site URL used for metadata and absolute links"),
});

/**
 * Server-only env vars. Never prefix these with NEXT_PUBLIC_.
 * Add secrets and private config here as the project grows.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const mergedSchema = serverSchema.merge(clientSchema);

const parsed = mergedSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    z.prettifyError(parsed.error),
  );
  throw new Error("Invalid environment variables. Check .env.example.");
}

export const env = parsed.data;

export type Env = z.infer<typeof mergedSchema>;
