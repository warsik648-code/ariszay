import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { nextTicketNumber } from "@/lib/support/sequences";
import { createNotification, notifyStaff } from "@/lib/support/notifications";
import {
  ticketCreatedEmail,
  staffReplyEmail,
  newTicketStaffEmail,
} from "@/lib/email/templates";

const OPEN_STATUSES: TicketStatus[] = [
  "NEW",
  "OPEN",
  "WAITING_CUSTOMER",
  "WAITING_STAFF",
];

/** Idempotent: one auto-created ORDER_SUPPORT ticket per order. */
export async function ensureAutoOrderTicket(orderId: string) {
  const existing = await db.ticket.findFirst({
    where: { orderId, autoCreated: true },
  });
  if (existing) return existing;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!order?.userId || !order.user) return null;

  const productNames = order.items.map((i) => i.productName).join(", ");
  const orderLabel = order.orderNumber ?? order.id.slice(-8).toUpperCase();
  const ticketNumber = await nextTicketNumber();

  const ticket = await db.ticket.create({
    data: {
      ticketNumber,
      userId: order.userId,
      orderId: order.id,
      category: "ORDER_SUPPORT",
      status: "NEW",
      priority: "NORMAL",
      subject: `Order support — ${orderLabel}`,
      autoCreated: true,
      messages: {
        create: {
          authorId: order.userId,
          isStaff: false,
          body: [
            "Automatic support ticket created after purchase.",
            "",
            `Order: ${orderLabel}`,
            `Products: ${productNames || "—"}`,
            `Payment status: ${order.paymentStatus}`,
            `Order status: ${order.status}`,
            `Purchase date (UTC): ${order.createdAt.toISOString()}`,
            `Customer: ${order.user.name ?? "—"} <${order.user.email}>`,
          ].join("\n"),
        },
      },
    },
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const ticketEmail = ticketCreatedEmail({
    name: order.user.name ?? "Customer",
    ticketNumber,
    orderNumber: orderLabel,
    productSummary: productNames,
  });

  await createNotification({
    userId: order.userId,
    type: "TICKET_CREATED",
    title: "Your support ticket has been created",
    body: `Ticket ${ticketNumber} is ready — reply anytime from Mission Control.`,
    href: `/account/tickets/${ticketNumber}`,
    email: { to: order.user.email, ...ticketEmail },
  });

  const staffEmail = newTicketStaffEmail({
    ticketNumber,
    orderNumber: orderLabel,
    customerEmail: order.user.email,
    category: "Order Support",
  });

  await notifyStaff({
    type: "NEW_TICKET_STAFF",
    title: `New ticket ${ticketNumber}`,
    body: `Order ${orderLabel} — ${order.user.email}`,
    href: `/admin/tickets/${ticketNumber}`,
    email: staffEmail,
  });

  void site;
  return ticket;
}

export async function createManualTicket(input: {
  userId: string;
  category: TicketCategory;
  subject: string;
  body: string;
  orderId?: string;
  priority?: TicketPriority;
}) {
  const openCount = await db.ticket.count({
    where: { userId: input.userId, status: { in: OPEN_STATUSES } },
  });
  if (openCount >= 20) {
    throw new Error("Too many open tickets. Close or wait on existing ones.");
  }

  if (input.orderId) {
    const order = await db.order.findFirst({
      where: { id: input.orderId, userId: input.userId },
    });
    if (!order) throw new Error("Order not found");
  }

  const ticketNumber = await nextTicketNumber();
  const ticket = await db.ticket.create({
    data: {
      ticketNumber,
      userId: input.userId,
      orderId: input.orderId,
      category: input.category,
      status: "NEW",
      priority: input.priority ?? "NORMAL",
      subject: input.subject.slice(0, 200),
      autoCreated: false,
      messages: {
        create: {
          authorId: input.userId,
          isStaff: false,
          body: input.body.slice(0, 10000),
        },
      },
    },
  });

  await notifyStaff({
    type: "NEW_TICKET_STAFF",
    title: `New ticket ${ticketNumber}`,
    body: input.subject,
    href: `/admin/tickets/${ticketNumber}`,
  });

  return ticket;
}

export async function addTicketReply(input: {
  ticketId: string;
  authorId: string;
  body: string;
  isStaff: boolean;
}) {
  const ticket = await db.ticket.findUnique({
    where: { id: input.ticketId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!ticket) throw new Error("Ticket not found");
  if (ticket.status === "CLOSED" && !input.isStaff) {
    throw new Error("Ticket is closed. Reopen it to reply.");
  }

  const message = await db.ticketMessage.create({
    data: {
      ticketId: input.ticketId,
      authorId: input.authorId,
      body: input.body.slice(0, 10000),
      isStaff: input.isStaff,
    },
  });

  await db.ticket.update({
    where: { id: input.ticketId },
    data: {
      status: input.isStaff ? "WAITING_CUSTOMER" : "WAITING_STAFF",
      updatedAt: new Date(),
      closedAt: null,
    },
  });

  if (input.isStaff) {
    const email = staffReplyEmail({
      name: ticket.user.name ?? "Customer",
      ticketNumber: ticket.ticketNumber,
      preview: input.body.slice(0, 200),
    });
    await createNotification({
      userId: ticket.userId,
      type: "STAFF_REPLIED",
      title: `Staff replied on ${ticket.ticketNumber}`,
      body: input.body.slice(0, 180),
      href: `/account/tickets/${ticket.ticketNumber}`,
      email: { to: ticket.user.email, ...email },
    });
  } else {
    await notifyStaff({
      type: "NEW_TICKET_STAFF",
      title: `Customer reply on ${ticket.ticketNumber}`,
      body: input.body.slice(0, 180),
      href: `/admin/tickets/${ticket.ticketNumber}`,
    });
  }

  return message;
}

export async function setTicketStatus(input: {
  ticketId: string;
  status: TicketStatus;
}) {
  return db.ticket.update({
    where: { id: input.ticketId },
    data: {
      status: input.status,
      closedAt:
        input.status === "CLOSED" || input.status === "RESOLVED"
          ? new Date()
          : null,
    },
  });
}

export async function assignTicket(input: {
  ticketId: string;
  assigneeId: string;
  assignedById: string;
}) {
  await db.ticketAssignment.create({
    data: {
      ticketId: input.ticketId,
      assigneeId: input.assigneeId,
      assignedById: input.assignedById,
    },
  });
  return db.ticket.update({
    where: { id: input.ticketId },
    data: {
      assignedToId: input.assigneeId,
      status: "OPEN",
    },
  });
}

export async function addInternalNote(input: {
  ticketId?: string;
  orderId?: string;
  authorId: string;
  body: string;
}) {
  if (!input.ticketId && !input.orderId) {
    throw new Error("ticketId or orderId required");
  }
  return db.internalNote.create({
    data: {
      ticketId: input.ticketId,
      orderId: input.orderId,
      authorId: input.authorId,
      body: input.body.slice(0, 10000),
    },
  });
}
