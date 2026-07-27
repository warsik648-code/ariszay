import type { RefundReason, RefundStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { createNotification, notifyStaff } from "@/lib/support/notifications";
import { createManualTicket } from "@/lib/support/tickets";
import { refundUpdatedEmail, refundRequestStaffEmail } from "@/lib/email/templates";

export async function requestRefund(input: {
  userId: string;
  orderId: string;
  reason: RefundReason;
  description: string;
}) {
  const order = await db.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    include: { items: true, user: { select: { email: true, name: true } } },
  });
  if (!order || !order.user) throw new Error("Order not found");

  const active = await db.refundRequest.findFirst({
    where: {
      orderId: order.id,
      status: { in: ["REQUESTED", "REVIEWING", "APPROVED"] },
    },
  });
  if (active) throw new Error("A refund request is already in progress for this order");

  const ticket = await createManualTicket({
    userId: input.userId,
    orderId: order.id,
    category: "REFUND_REQUEST",
    subject: `Refund request — ${order.orderNumber ?? order.id.slice(-8).toUpperCase()}`,
    body: `Refund reason: ${input.reason}\n\n${input.description}`,
    priority: "HIGH",
  });

  const refund = await db.refundRequest.create({
    data: {
      orderId: order.id,
      userId: input.userId,
      ticketId: ticket.id,
      reason: input.reason,
      description: input.description.slice(0, 5000),
      status: "REQUESTED",
    },
  });

  const orderLabel = order.orderNumber ?? order.id.slice(-8).toUpperCase();
  await notifyStaff({
    type: "REFUND_REQUEST_STAFF",
    title: `Refund request for ${orderLabel}`,
    body: `${order.user.email} — ${input.reason}`,
    href: `/admin/refunds`,
    email: refundRequestStaffEmail({
      orderNumber: orderLabel,
      customerEmail: order.user.email,
      reason: input.reason,
    }),
  });

  return refund;
}

export async function reviewRefund(input: {
  refundId: string;
  reviewerId: string;
  status: Extract<RefundStatus, "REVIEWING" | "APPROVED" | "REJECTED" | "COMPLETED">;
  reviewNote?: string;
}) {
  const refund = await db.refundRequest.findUnique({
    where: { id: input.refundId },
    include: {
      order: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!refund) throw new Error("Refund request not found");

  const updated = await db.refundRequest.update({
    where: { id: input.refundId },
    data: {
      status: input.status,
      reviewerId: input.reviewerId,
      reviewNote: input.reviewNote?.slice(0, 2000),
      resolvedAt:
        input.status === "REJECTED" ||
        input.status === "COMPLETED" ||
        input.status === "APPROVED"
          ? input.status === "REJECTED" || input.status === "COMPLETED"
            ? new Date()
            : refund.resolvedAt
          : null,
    },
  });

  if (input.status === "COMPLETED") {
    await db.order.update({
      where: { id: refund.orderId },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
      },
    });
  }

  const email = refundUpdatedEmail({
    name: refund.user.name ?? "Customer",
    orderNumber: refund.order.orderNumber ?? refund.orderId.slice(-8).toUpperCase(),
    status: input.status,
  });

  await createNotification({
    userId: refund.userId,
    type: "REFUND_UPDATED",
    title: `Refund ${input.status.toLowerCase()}`,
    body: `Your refund request is now ${input.status}.`,
    href: `/account/refunds`,
    email: { to: refund.user.email, ...email },
  });

  return updated;
}
