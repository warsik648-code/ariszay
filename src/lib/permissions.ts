import type { UserRole, Prisma } from "@prisma/client";
import { getServerSession, getSessionRole } from "@/lib/auth-server";
import { db } from "@/lib/db";

export type Capability =
  | "tickets:read_all"
  | "tickets:reply_staff"
  | "tickets:assign"
  | "tickets:internal_note"
  | "tickets:status_any"
  | "refunds:review"
  | "orders:update"
  | "staff:manage"
  | "reports:read"
  | "admin:access";

const ROLE_CAPS: Record<UserRole, Capability[]> = {
  OWNER: [
    "admin:access",
    "tickets:read_all",
    "tickets:reply_staff",
    "tickets:assign",
    "tickets:internal_note",
    "tickets:status_any",
    "refunds:review",
    "orders:update",
    "staff:manage",
    "reports:read",
  ],
  ADMIN: [
    "admin:access",
    "tickets:read_all",
    "tickets:reply_staff",
    "tickets:assign",
    "tickets:internal_note",
    "tickets:status_any",
    "refunds:review",
    "orders:update",
    "reports:read",
  ],
  SUPPORT_MANAGER: [
    "admin:access",
    "tickets:read_all",
    "tickets:reply_staff",
    "tickets:assign",
    "tickets:internal_note",
    "tickets:status_any",
    "refunds:review",
    "reports:read",
  ],
  SUPPORT_AGENT: [
    "admin:access",
    "tickets:read_all",
    "tickets:reply_staff",
    "tickets:internal_note",
  ],
  CONTENT_MANAGER: ["admin:access"],
  ANALYST: ["admin:access", "tickets:read_all", "reports:read"],
  CUSTOMER: [],
};

export function roleHasCapability(role: UserRole, capability: Capability): boolean {
  return ROLE_CAPS[role]?.includes(capability) ?? false;
}

export async function requireSession() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireCapability(capability: Capability) {
  const session = await requireSession();
  const role = ((session.user as { role?: UserRole }).role ?? "CUSTOMER") as UserRole;
  if (!roleHasCapability(role, capability)) {
    throw new Error("Unauthorized");
  }
  return { session, role };
}

export async function requireStaffPortal() {
  return requireCapability("admin:access");
}

export async function assertOwnsOrder(userId: string, orderId: string) {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
  });
  if (!order) throw new Error("Order not found");
  return order;
}

export async function assertOwnsOrderByNumber(userId: string, orderNumber: string) {
  const order = await db.order.findFirst({
    where: { orderNumber, userId },
  });
  if (!order) throw new Error("Order not found");
  return order;
}

export async function assertTicketAccess(opts: {
  ticketId?: string;
  ticketNumber?: string;
  userId: string;
  role: UserRole;
  forReply?: boolean;
}) {
  const ticket = await db.ticket.findFirst({
    where: opts.ticketId
      ? { id: opts.ticketId }
      : { ticketNumber: opts.ticketNumber },
  });
  if (!ticket) throw new Error("Ticket not found");

  if (opts.role === "CUSTOMER") {
    if (ticket.userId !== opts.userId) throw new Error("Unauthorized");
    return ticket;
  }

  if (!roleHasCapability(opts.role, "tickets:read_all")) {
    throw new Error("Unauthorized");
  }

  if (opts.forReply && opts.role === "SUPPORT_AGENT") {
    // Agents may reply to unassigned or self-assigned tickets
    if (ticket.assignedToId && ticket.assignedToId !== opts.userId) {
      throw new Error("Unauthorized");
    }
  }

  return ticket;
}

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      meta: input.meta ?? undefined,
    },
  });
}

/** Soft check for UI (never trust alone). */
export async function currentRole(): Promise<UserRole | null> {
  return getSessionRole();
}
