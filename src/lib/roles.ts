import type { UserRole } from "@prisma/client";

/** Staff roles that may enter /admin (excludes CUSTOMER). */
export const ADMIN_ROLES: UserRole[] = [
  "ADMIN",
  "OWNER",
  "SUPPORT_AGENT",
  "SUPPORT_MANAGER",
  "CONTENT_MANAGER",
  "ANALYST",
];

export const OWNER_ADMIN_ROLES: UserRole[] = ["OWNER", "ADMIN"];
