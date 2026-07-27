"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth-server";
import { getCheatReferralUrl } from "@/config/ref-links";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  discordUsername: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().cuid(),
      planId: z.string().cuid(),
      quantity: z.number().int().min(1).max(10),
    }),
  ).min(1, "Cart is empty"),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { success: true; orderId: string; redirectUrl: string }
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

  // Get session (optional — guest checkout is allowed)
  const session = await getServerSession().catch(() => null);

  // ── Server-side price lookup ─────────────────────────────────────────────
  // NEVER trust prices submitted from the browser.
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

  // ── Coupon validation ────────────────────────────────────────────────────
  let discountAmount = 0;
  let couponRecord = null;

  if (data.couponCode) {
    couponRecord = await db.coupon.findFirst({
      where: {
        code: data.couponCode.toUpperCase(),
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
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

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (couponRecord.type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(couponRecord.value)) / 100;
    } else {
      discountAmount = Math.min(Number(couponRecord.value), subtotal);
    }
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totalAmount = Math.max(subtotal - discountAmount, 0);

  // ── Create order in DB ───────────────────────────────────────────────────
  const order = await db.order.create({
    data: {
      userId: session?.user?.id ?? null,
      guestEmail: session ? null : data.email,
      guestName: session ? null : data.name,
      discordUsername: data.discordUsername,
      status: "PENDING",
      paymentStatus: "UNPAID",
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

  // Update coupon usage count
  if (couponRecord) {
    await db.coupon.update({
      where: { id: couponRecord.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  // ── Payment redirect ─────────────────────────────────────────────────────
  // For now, redirect to the referral payment URL for the first item.
  // Replace with real payment gateway (Stripe/Paddle/etc.) when ready.
  const firstItem = lineItems[0];
  if (firstItem) {
    const product = await db.product.findUnique({
      where: { id: firstItem.productId },
      include: { game: { select: { slug: true } } },
    });

    // If it's a cheat product with a game, use referral URL
    if (product?.game?.slug) {
      // Map product slug to the ref-links config
      const tierFromSlug = product.slug?.split("-").pop() as "xray" | "pro" | "private" | undefined;
      if (tierFromSlug) {
        const referralUrl = getCheatReferralUrl(
          product.game.slug as "isle" | "naraka",
          tierFromSlug,
        );
        return {
          success: true,
          orderId: order.id,
          redirectUrl: referralUrl,
        };
      }
    }
  }

  // Fallback: redirect to success page
  return {
    success: true,
    orderId: order.id,
    redirectUrl: `/checkout/success?orderId=${order.id}`,
  };
}
