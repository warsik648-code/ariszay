"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { RefundReason, RefundStatus } from "@prisma/client";
import {
  assertOwnsOrder,
  requireCapability,
  requireSession,
  writeAuditLog,
} from "@/lib/permissions";
import { requestRefund, reviewRefund } from "@/lib/support/refunds";

export async function submitRefundRequest(input: {
  orderId: string;
  reason: RefundReason;
  description: string;
}) {
  const session = await requireSession();
  const parsed = z
    .object({
      orderId: z.string().cuid(),
      reason: z.enum(["NOT_WORKING", "WRONG_PRODUCT", "PAYMENT_ISSUE", "OTHER"]),
      description: z.string().min(5).max(5000),
    })
    .safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  await assertOwnsOrder(session.user.id, parsed.data.orderId);
  const refund = await requestRefund({
    userId: session.user.id,
    ...parsed.data,
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "refund.request",
    targetType: "RefundRequest",
    targetId: refund.id,
  });

  revalidatePath("/account/refunds");
  revalidatePath(`/account/orders`);
  revalidatePath("/admin/refunds");
  return { id: refund.id };
}

export async function staffReviewRefund(formData: FormData) {
  const { session } = await requireCapability("refunds:review");
  const parsed = z
    .object({
      refundId: z.string().cuid(),
      status: z.enum(["REVIEWING", "APPROVED", "REJECTED", "COMPLETED"]),
      reviewNote: z.string().max(2000).optional(),
    })
    .safeParse({
      refundId: formData.get("refundId"),
      status: formData.get("status"),
      reviewNote: formData.get("reviewNote") || undefined,
    });
  if (!parsed.success) throw new Error("Invalid input");

  await reviewRefund({
    refundId: parsed.data.refundId,
    reviewerId: session.user.id,
    status: parsed.data.status as Extract<
      RefundStatus,
      "REVIEWING" | "APPROVED" | "REJECTED" | "COMPLETED"
    >,
    reviewNote: parsed.data.reviewNote,
  });

  await writeAuditLog({
    actorId: session.user.id,
    action: "refund.review",
    targetType: "RefundRequest",
    targetId: parsed.data.refundId,
    meta: { status: parsed.data.status },
  });

  revalidatePath("/admin/refunds");
  revalidatePath("/account/refunds");
}
