"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  requireCapability,
  roleHasCapability,
  writeAuditLog,
} from "@/lib/permissions";
import { decryptGiftCardCode } from "@/lib/payments/gift-card";
import { ensureAutoOrderTicket } from "@/lib/support/tickets";
import { createNotification } from "@/lib/support/notifications";
import type { UserRole } from "@prisma/client";

async function requestMeta() {
  const hdrs = await headers();
  return {
    ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null,
    userAgent: hdrs.get("user-agent"),
  };
}

const reviewSchema = z.object({
  verificationId: z.string().cuid(),
  action: z.enum(["approve", "reject"]),
  internalNote: z.string().max(4000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

export async function reviewPaymentVerification(input: {
  verificationId: string;
  action: "approve" | "reject";
  internalNote?: string;
  rejectionReason?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const { session, role } = await requireCapability("payments:verify");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const verification = await db.paymentVerification.findUnique({
    where: { id: parsed.data.verificationId },
    include: { order: true },
  });
  if (!verification) return { success: false, error: "Verification not found" };
  if (verification.status !== "PENDING") {
    return { success: false, error: "This payment was already reviewed." };
  }

  const meta = await requestMeta();
  const now = new Date();

  if (parsed.data.action === "approve") {
    await db.$transaction(async (tx) => {
      await tx.paymentVerification.update({
        where: { id: verification.id },
        data: {
          status: "APPROVED",
          verifiedAt: now,
          verifiedById: session.user.id,
          internalNote: parsed.data.internalNote || verification.internalNote,
        },
      });

      await tx.order.update({
        where: { id: verification.orderId },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          deliveryStatus:
            verification.order.deliveryStatus === "PENDING"
              ? "PROCESSING"
              : verification.order.deliveryStatus,
          statusHistory: {
            create: {
              fromStatus: verification.order.status,
              toStatus: "PAID",
              fromPaymentStatus: verification.order.paymentStatus,
              toPaymentStatus: "PAID",
              fromDeliveryStatus: verification.order.deliveryStatus,
              toDeliveryStatus:
                verification.order.deliveryStatus === "PENDING"
                  ? "PROCESSING"
                  : null,
              actorId: session.user.id,
              note: "Rewarble gift card payment approved",
            },
          },
        },
      });

      await tx.payment.updateMany({
        where: { orderId: verification.orderId, status: "PENDING" },
        data: { status: "PAID" },
      });
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: "payment.approve",
      targetType: "PaymentVerification",
      targetId: verification.id,
      meta: {
        orderId: verification.orderId,
        orderNumber: verification.order.orderNumber,
        amount: Number(verification.amount),
        last4: verification.giftCardLast4,
        role,
      },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    await ensureAutoOrderTicket(verification.orderId).catch(() => null);

    if (verification.order.userId) {
      await createNotification({
        userId: verification.order.userId,
        type: "PAYMENT_VERIFIED",
        title: `Payment verified — ${verification.order.orderNumber ?? "order"}`,
        body: "Your gift card payment was approved. Your order is now Paid.",
        href: verification.order.orderNumber
          ? `/account/orders/${verification.order.orderNumber}`
          : "/account/orders",
      });
    }
  } else {
    await db.$transaction(async (tx) => {
      await tx.paymentVerification.update({
        where: { id: verification.id },
        data: {
          status: "REJECTED",
          verifiedAt: now,
          verifiedById: session.user.id,
          internalNote: parsed.data.internalNote || verification.internalNote,
          rejectionReason:
            parsed.data.rejectionReason || "Payment code could not be verified.",
        },
      });

      await tx.order.update({
        where: { id: verification.orderId },
        data: {
          paymentStatus: "FAILED",
          statusHistory: {
            create: {
              fromStatus: verification.order.status,
              toStatus: null,
              fromPaymentStatus: verification.order.paymentStatus,
              toPaymentStatus: "FAILED",
              actorId: session.user.id,
              note: "Rewarble gift card payment rejected",
            },
          },
        },
      });

      await tx.payment.updateMany({
        where: { orderId: verification.orderId, status: "PENDING" },
        data: { status: "FAILED" },
      });
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: "payment.reject",
      targetType: "PaymentVerification",
      targetId: verification.id,
      meta: {
        orderId: verification.orderId,
        orderNumber: verification.order.orderNumber,
        last4: verification.giftCardLast4,
        reason: parsed.data.rejectionReason,
        role,
      },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (verification.order.userId) {
      await createNotification({
        userId: verification.order.userId,
        type: "PAYMENT_REJECTED",
        title: `Payment failed — ${verification.order.orderNumber ?? "order"}`,
        body:
          parsed.data.rejectionReason ||
          "Your gift card payment could not be verified. Contact support if needed.",
        href: verification.order.orderNumber
          ? `/account/orders/${verification.order.orderNumber}`
          : "/account/orders",
      });
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/payments/${verification.id}`);
  revalidatePath(`/admin/orders/${verification.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  if (verification.order.orderNumber) {
    revalidatePath(`/account/orders/${verification.order.orderNumber}`);
  }

  return { success: true };
}

export async function updatePaymentInternalNote(input: {
  verificationId: string;
  internalNote: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const { session } = await requireCapability("payments:verify");
  const note = input.internalNote.slice(0, 4000);
  const verification = await db.paymentVerification.findUnique({
    where: { id: input.verificationId },
  });
  if (!verification) return { success: false, error: "Not found" };

  await db.paymentVerification.update({
    where: { id: verification.id },
    data: { internalNote: note },
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "payment.note",
    targetType: "PaymentVerification",
    targetId: verification.id,
    meta: { noteLength: note.length },
  });

  revalidatePath(`/admin/payments/${verification.id}`);
  return { success: true };
}

/**
 * Reveal full gift card code — OWNER/ADMIN only.
 * Always writes an audit log entry.
 */
export async function revealGiftCardCode(
  verificationId: string,
): Promise<
  { success: true; code: string } | { success: false; error: string }
> {
  const { session, role } = await requireCapability("payments:view_code");
  if (!roleHasCapability(role as UserRole, "payments:view_code")) {
    return { success: false, error: "Unauthorized" };
  }

  const verification = await db.paymentVerification.findUnique({
    where: { id: verificationId },
  });
  if (!verification) return { success: false, error: "Not found" };

  const meta = await requestMeta();
  let code: string;
  try {
    code = decryptGiftCardCode(verification.giftCardCodeEncrypted);
  } catch {
    return { success: false, error: "Unable to decrypt code" };
  }

  await writeAuditLog({
    actorId: session.user.id,
    action: "payment.code_view",
    targetType: "PaymentVerification",
    targetId: verification.id,
    meta: {
      last4: verification.giftCardLast4,
      orderId: verification.orderId,
    },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { success: true, code };
}
