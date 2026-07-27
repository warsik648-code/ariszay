"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession, isOwnerOrAdmin } from "@/lib/auth-server";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const updateOrderSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(["PENDING", "PAID", "DELIVERED", "REFUNDED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  internalNote: z.string().max(2000).optional(),
  customerNote: z.string().max(2000).optional(),
});

export async function updateOrderStatus(formData: FormData) {
  const authorized = await isOwnerOrAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const session = await getServerSession();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = updateOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    internalNote: formData.get("internalNote") || undefined,
    customerNote: formData.get("customerNote") || undefined,
  });

  if (!parsed.success) throw new Error("Invalid input");

  const { orderId, ...updates } = parsed.data;

  // Fetch original for audit log
  const original = await db.order.findUnique({ where: { id: orderId } });
  if (!original) throw new Error("Order not found");

  await db.order.update({
    where: { id: orderId },
    data: {
      ...(updates.status ? { status: updates.status as OrderStatus } : {}),
      ...(updates.paymentStatus
        ? { paymentStatus: updates.paymentStatus as PaymentStatus }
        : {}),
      ...(updates.internalNote !== undefined
        ? { internalNote: updates.internalNote }
        : {}),
      ...(updates.customerNote !== undefined
        ? { customerNote: updates.customerNote }
        : {}),
      ...(updates.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "order.update",
      targetType: "Order",
      targetId: orderId,
      meta: {
        before: {
          status: original.status,
          paymentStatus: original.paymentStatus,
        },
        after: updates,
      },
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
