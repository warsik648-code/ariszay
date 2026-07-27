"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth-server";
import { getCheatReferralUrl } from "@/config/ref-links";
import { nextOrderNumber } from "@/lib/support/sequences";
import { ensureAutoOrderTicket } from "@/lib/support/tickets";
import { createNotification, notifyStaff } from "@/lib/support/notifications";
import { orderCreatedEmail } from "@/lib/email/templates";
import {
  encryptGiftCardCode,
  giftCardLast4,
  normalizeGiftCardCode,
} from "@/lib/payments/gift-card";
import { REWARBLE_PAYMENT_METHOD } from "@/lib/payments/rewarble";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  discordUsername: z.string().min(2, "Discord username is required").max(64),
  giftCardCode: z
    .string()
    .min(8, "Enter your gift card code")
    .max(64, "Gift card code is too long"),
  paymentMethod: z.literal(REWARBLE_PAYMENT_METHOD),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        planId: z.string().cuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Cart is empty"),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | {
      success: true;
      orderId: string;
      orderNumber?: string;
      ticketNumber?: string;
      redirectUrl: string;
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createOrder(
  formData: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const session = await getServerSession().catch(() => null);
  const giftCode = normalizeGiftCardCode(data.giftCardCode);
  if (giftCode.replace(/-/g, "").length < 8) {
    return {
      success: false,
      error: "Gift card code looks incomplete.",
      fieldErrors: { giftCardCode: ["Enter the full gift card code"] },
    };
  }

  const lineItems = await Promise.all(
    data.items.map(async (item) => {
      const plan = await db.productPlan.findFirst({
        where: { id: item.planId, productId: item.productId, active: true },
        include: { product: { select: { id: true, name: true, published: true } } },
      });

      if (!plan || !plan.product.published) {
        throw new Error(`Product plan not found or unavailable: ${item.planId}`);
      }

      return {
        productId: item.productId,
        planId: item.planId,
        productName: plan.product.name,
        planLabel: plan.label,
        unitPrice: Number(plan.price),
        quantity: item.quantity,
      };
    }),
  ).catch((err: Error) => {
    return { error: err.message } as { error: string };
  });

  if ("error" in lineItems) {
    return { success: false, error: lineItems.error };
  }

  let discountAmount = 0;
  let couponRecord = null;

  if (data.couponCode) {
    couponRecord = await db.coupon.findFirst({
      where: {
        code: data.couponCode.toUpperCase(),
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    if (!couponRecord) {
      return { success: false, error: "Coupon code is invalid or expired." };
    }

    if (
      couponRecord.maxUsages !== null &&
      couponRecord.usageCount >= couponRecord.maxUsages
    ) {
      return { success: false, error: "This coupon has reached its usage limit." };
    }

    const couponSubtotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (couponRecord.type === "PERCENTAGE") {
      discountAmount = (couponSubtotal * Number(couponRecord.value)) / 100;
    } else {
      discountAmount = Math.min(Number(couponRecord.value), couponSubtotal);
    }
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totalAmount = Math.max(subtotal - discountAmount, 0);
  const orderNumber = await nextOrderNumber();

  const hdrs = await headers();
  const ipAddress =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    null;
  const userAgent = hdrs.get("user-agent");

  const encrypted = encryptGiftCardCode(giftCode);
  const last4 = giftCardLast4(giftCode);

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id ?? null,
      guestEmail: session ? null : data.email,
      guestName: session ? null : data.name,
      discordUsername: data.discordUsername.trim(),
      status: "PENDING",
      paymentStatus: "PENDING",
      deliveryStatus: "PENDING",
      totalAmount,
      discountAmount,
      couponCode: data.couponCode?.toUpperCase() ?? null,
      referralCode: data.referralCode ?? null,
      items: {
        create: lineItems.map((item) => ({
          productId: item.productId,
          planId: item.planId,
          productName: item.productName,
          planLabel: item.planLabel,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      },
      payments: {
        create: {
          amount: totalAmount,
          status: "PENDING",
          provider: REWARBLE_PAYMENT_METHOD,
          providerTxId: `masked:${last4}`,
          providerData: {
            method: REWARBLE_PAYMENT_METHOD,
            giftCardLast4: last4,
          },
        },
      },
      paymentVerifications: {
        create: {
          userId: session?.user?.id ?? null,
          paymentMethod: REWARBLE_PAYMENT_METHOD,
          giftCardCodeEncrypted: encrypted,
          giftCardLast4: last4,
          discordUsername: data.discordUsername.trim(),
          amount: totalAmount,
          status: "PENDING",
          ipAddress,
          userAgent,
        },
      },
      statusHistory: {
        create: {
          toStatus: "PENDING",
          toPaymentStatus: "PENDING",
          toDeliveryStatus: "PENDING",
          actorId: session?.user?.id ?? null,
          note: "Order created — awaiting Rewarble gift card verification",
        },
      },
      ...(couponRecord
        ? {
            couponUsage: {
              create: {
                couponId: couponRecord.id,
                userId: session?.user?.id ?? null,
              },
            },
          }
        : {}),
    },
  });

  if (couponRecord) {
    await db.coupon.update({
      where: { id: couponRecord.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  let ticketNumber: string | undefined;

  if (session?.user?.id) {
    const ticket = await ensureAutoOrderTicket(order.id).catch(() => null);
    ticketNumber = ticket?.ticketNumber;

    const email = orderCreatedEmail({
      name: data.name,
      orderNumber,
      total: totalAmount,
    });
    await createNotification({
      userId: session.user.id,
      type: "ORDER_CREATED",
      title: `Order ${orderNumber} submitted`,
      body: "Payment code submitted successfully. Your order is being reviewed.",
      href: `/account/orders/${orderNumber}`,
      email: { to: session.user.email, ...email },
    });
  }

  await notifyStaff({
    type: "PAYMENT_PENDING_STAFF",
    title: `Payment verification ${orderNumber}`,
    body: `${data.email} — $${totalAmount.toFixed(2)} · Rewarble · ****${last4}`,
    href: `/admin/payments`,
  });

  const successUrl = `/checkout/success?orderId=${order.id}&orderNumber=${orderNumber}&pendingVerification=1${
    ticketNumber ? `&ticketNumber=${ticketNumber}` : ""
  }`;

  const firstItem = lineItems[0];
  if (firstItem) {
    const product = await db.product.findUnique({
      where: { id: firstItem.productId },
      include: { game: { select: { slug: true } } },
    });

    if (product?.game?.slug) {
      const tierFromSlug = product.slug?.split("-").pop() as
        | "xray"
        | "pro"
        | "private"
        | undefined;
      if (tierFromSlug) {
        void getCheatReferralUrl(
          product.game.slug as "isle" | "naraka",
          tierFromSlug,
        );
      }
    }
  }

  return {
    success: true,
    orderId: order.id,
    orderNumber,
    ticketNumber,
    redirectUrl: successUrl,
  };
}
