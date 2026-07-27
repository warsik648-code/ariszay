import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { ADMIN_ROLES, OWNER_ADMIN_ROLES } from "@/lib/roles";

/** Get the current session in a Server Component or Server Action. */
export async function getServerSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

/** Get the current user's role. Returns null if not authenticated. */
export async function getSessionRole(): Promise<UserRole | null> {
  const session = await getServerSession();
  if (!session?.user) return null;
  return (session.user as { role?: UserRole }).role ?? null;
}

/** Returns true if the current user has any admin-level role. */
export async function isAdminSession(): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null && ADMIN_ROLES.includes(role);
}

/** Returns true if the current user is OWNER or ADMIN. */
export async function isOwnerOrAdmin(): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null && OWNER_ADMIN_ROLES.includes(role);
}
