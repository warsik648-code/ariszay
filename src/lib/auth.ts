import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true in production after SMTP is configured
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,     // 7 days
    updateAge: 60 * 60 * 24,          // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                 // client-side cache 5 min
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false, // never accept from client — only set server-side
      },
      discordId: {
        type: "string",
        required: false,
      },
      banned: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "ariszay",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
