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

/** Seeded plan IDs are `{productCuid}-plan-{n}` — not pure cuids. */
const idSchema = z
  .string()
  .min(1, "Missing product reference")
  .max(120, "Invalid product reference");

const checkoutSchema = z.object({
  email: z.preprocess(
    (v) =>
      typeof v === "string" && v.trim() === ""
        ? undefined
        : typeof v === "string"
          ? v.trim()
          : v,
    z.string().email("Please enter a valid email address").max(200).optional(),
  ),
  discordUsername: z
    .string()
    .trim()
    .min(2, "Enter your Discord username (at least 2 characters)")
    .max(64, "Discord username is too long"),
  giftCardCode: z
    .string()
    .trim()
    .min(8, "Enter your full gift card code")
    .max(80, "Gift card code is too long"),
  paymentMethod: z.literal(REWARBLE_PAYMENT_METHOD, {
    message: "Select Rewarble Visa Gift Card as payment method",
  }),
  items: z
    .array(
      z.object({
        productId: idSchema,
        planId: idSchema,
        quantity: z
          .number({ message: "Invalid quantity" })
          .int()
          .min(1, "Quantity must be at least 1")
          .max(10, "Quantity is too high"),
      }),
    )
    .min(1, "Your cart is empty — add a product before checkout"),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "Please agree to the Terms of Service and Refund Policy",
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

function formatCheckoutZodError(error: z.ZodError): {
  error: string;
  fieldErrors: Record<string, string[]>;
} {
  const fieldErrors: Record<string, string[]> = {};
  const messages: string[] = [];

  for (const issue of error.issues) {
    const top =
      typeof issue.path[0] === "string"
        ? issue.path[0]
        : issue.path.length === 0
          ? "_form"
          : "items";

    let bucket = top;
    if (top === "items") {
      const field = issue.path[2];
      if (field === "productId" || field === "planId") {
        bucket = "items";
        const msg =
          "A product in your cart is invalid or outdated. Remove it and click Buy Now again.";
        fieldErrors[bucket] = [...(fieldErrors[bucket] ?? []), msg];
        if (!messages.includes(msg)) messages.push(msg);
        continue;
      }
    }

    fieldErrors[bucket] = [...(fieldErrors[bucket] ?? []), issue.message];
    if (!messages.includes(issue.message)) messages.push(issue.message);
  }

  return {
    error:
      messages.length === 1
        ? messages[0]!
        : messages.length > 1
          ? messages.join(" · ")
          : "Please fix the highlighted fields and try again.",
    fieldErrors,
  };
}

export async function createOrder(
  formData: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, ...formatCheckoutZodError(parsed.error) };
  }

  const data = parsed.data;
  const session = await getServerSession().catch(() => null);
  const giftCode = normalizeGiftCardCode(data.giftCardCode);
  if (giftCode.replace(/-/g, "").length < 8) {
    return {
      success: false,
      error: "Gift card code looks incomplete. Paste the full code from G2A.",
      fieldErrors: {
        giftCardCode: ["Paste the full gift card code (letters and numbers)."],
      },
    };
  }

  const lineResults = await Promise.all(
    data.items.map(async (item) => {
      const plan = await db.productPlan.findFirst({
        where: { id: item.planId, productId: item.productId, active: true },
        include: { product: { select: { id: true, name: true, published: true } } },
      });

      if (!plan || !plan.product.published) {
        return {
          ok: false as const,
          error: `A product in your cart is no longer available. Remove it and click Buy Now again.`,
        };
      }

      return {
        ok: true as const,
        item: {
          productId: item.productId,
          planId: item.planId,
          productName: plan.product.name,
          planLabel: plan.label,
          unitPrice: Number(plan.price),
          quantity: item.quantity,
        },
      };
    }),
  );

  const failedLine = lineResults.find((row) => !row.ok);
  if (failedLine && !failedLine.ok) {
    return {
      success: false,
      error: failedLine.error,
      fieldErrors: { items: [failedLine.error] },
    };
  }

  const resolvedItems = lineResults.flatMap((row) => (row.ok ? [row.item] : []));

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
      return {
        success: false,
        error: "Coupon code is invalid or expired.",
        fieldErrors: { couponCode: ["Coupon code is invalid or expired."] },
      };
    }

    if (
      couponRecord.maxUsages !== null &&
      couponRecord.usageCount >= couponRecord.maxUsages
    ) {
      return {
        success: false,
        error: "This coupon has reached its usage limit.",
        fieldErrors: { couponCode: ["This coupon has reached its usage limit."] },
      };
    }

    const couponSubtotal = resolvedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    if (couponRecord.type === "PERCENTAGE") {
      discountAmount = (couponSubtotal * Number(couponRecord.value)) / 100;
    } else {
      discountAmount = Math.min(Number(couponRecord.value), couponSubtotal);
    }
  }

  const subtotal = resolvedItems.reduce(
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

  try {
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        guestEmail: session ? null : (data.email ?? null),
        guestName: null,
        discordUsername: data.discordUsername.trim(),
        status: "PENDING",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        totalAmount,
        discountAmount,
        couponCode: data.couponCode?.toUpperCase() ?? null,
        referralCode: data.referralCode ?? null,
        items: {
          create: resolvedItems.map((item) => ({
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

      const emailTpl = orderCreatedEmail({
        name: session.user.name || "there",
        orderNumber,
        total: totalAmount,
      });
      await createNotification({
        userId: session.user.id,
        type: "ORDER_CREATED",
        title: `Order ${orderNumber} submitted`,
        body: "Payment code submitted successfully. Your order is being reviewed.",
        href: `/account/orders/${orderNumber}`,
        email: { to: session.user.email, ...emailTpl },
      });
    }

    const contactLabel =
      session?.user?.email || data.email || data.discordUsername.trim() || "Guest";

    await notifyStaff({
      type: "PAYMENT_PENDING_STAFF",
      title: `Payment verification ${orderNumber}`,
      body: `${contactLabel} — $${totalAmount.toFixed(2)} · Rewarble · ****${last4}`,
      href: `/admin/payments`,
    });

    const successUrl = `/checkout/success?orderId=${order.id}&orderNumber=${orderNumber}&pendingVerification=1${
      ticketNumber ? `&ticketNumber=${ticketNumber}` : ""
    }`;

    const firstItem = resolvedItems[0];
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
  } catch (err) {
    console.error("[checkout] createOrder failed", err);
    return {
      success: false,
      error:
        "We could not place your order due to a server error. Please try again in a moment.",
    };
  }
}
