"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCapability, writeAuditLog } from "@/lib/permissions";
import { ensureAutoOrderTicket } from "@/lib/support/tickets";
import { createNotification } from "@/lib/support/notifications";
import type { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";

const updateOrderSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PAID", "DELIVERED", "REFUNDED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  deliveryStatus: z.enum(["PENDING", "PROCESSING", "DELIVERED", "FAILED"]).optional(),
  internalNote: z.string().max(2000).optional(),
  customerNote: z.string().max(2000).optional(),
});

export async function updateOrderStatus(formData: FormData) {
  const { session } = await requireCapability("orders:update");

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    deliveryStatus: formData.get("deliveryStatus") || undefined,
    internalNote: formData.get("internalNote") || undefined,
    customerNote: formData.get("customerNote") || undefined,
  });

  if (!parsed.success) throw new Error("Invalid input");

  const { orderId, ...updates } = parsed.data;

  const original = await db.order.findUnique({ where: { id: orderId } });
  if (!original) throw new Error("Order not found");

  let deliveryStatus = updates.deliveryStatus as DeliveryStatus | undefined;
  if (updates.status === "DELIVERED" && !deliveryStatus) {
    deliveryStatus = "DELIVERED";
  }
  if (updates.status === "PAID" && !deliveryStatus && original.deliveryStatus === "PENDING") {
    deliveryStatus = "PROCESSING";
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      ...(updates.status ? { status: updates.status as OrderStatus } : {}),
      ...(updates.paymentStatus
        ? { paymentStatus: updates.paymentStatus as PaymentStatus }
        : {}),
      ...(deliveryStatus ? { deliveryStatus } : {}),
      ...(updates.internalNote !== undefined
        ? { internalNote: updates.internalNote }
        : {}),
      ...(updates.customerNote !== undefined
        ? { customerNote: updates.customerNote }
        : {}),
      ...(updates.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      ...(updates.status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
      statusHistory: {
        create: {
          fromStatus: original.status,
          toStatus: (updates.status as OrderStatus | undefined) ?? null,
          fromPaymentStatus: original.paymentStatus,
          toPaymentStatus: (updates.paymentStatus as PaymentStatus | undefined) ?? null,
          fromDeliveryStatus: original.deliveryStatus,
          toDeliveryStatus: deliveryStatus ?? null,
          actorId: session.user.id,
          note: "Admin status update",
        },
      },
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "order.update",
    targetType: "Order",
    targetId: orderId,
    meta: {
      before: {
        status: original.status,
        paymentStatus: original.paymentStatus,
        deliveryStatus: original.deliveryStatus,
      },
      after: { ...updates, deliveryStatus },
    },
  });

  if (updates.paymentStatus === "PAID" || updates.status === "PAID") {
    await ensureAutoOrderTicket(orderId).catch(() => null);
  }

  if (updates.status === "DELIVERED" && original.userId) {
    await createNotification({
      userId: original.userId,
      type: "ORDER_COMPLETED",
      title: `Order ${original.orderNumber ?? orderId.slice(-8).toUpperCase()} delivered`,
      body: "Your order is marked delivered.",
      href: original.orderNumber
        ? `/account/orders/${original.orderNumber}`
        : "/account/orders",
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/account/orders");
}
