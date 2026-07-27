"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getProductCode } from "@/lib/product-code";
import type { CartItem } from "@/store/cart";

const inputSchema = z.object({
  productSlug: z.string().min(1).max(120),
  plan: z.enum(["monthly", "lifetime"]).optional(),
});

export type ResolveCartResult =
  | { success: true; item: CartItem }
  | { success: false; error: string };

function tierFromSlug(slug: string): string {
  const part = slug.split("-").pop() ?? slug;
  return part;
}

/** Resolve a public product slug (+ optional plan) into a cart line with DB CUIDs. */
export async function resolveProductForCart(
  productSlug: string,
  plan?: "monthly" | "lifetime",
): Promise<ResolveCartResult> {
  const parsed = inputSchema.safeParse({ productSlug, plan });
  if (!parsed.success) {
    return { success: false, error: "Invalid product." };
  }

  const product = await db.product.findFirst({
    where: { slug: parsed.data.productSlug, published: true },
    include: {
      game: { select: { slug: true, name: true, shortName: true } },
      plans: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || product.plans.length === 0) {
    return { success: false, error: "Product is not available for purchase." };
  }

  const hint = parsed.data.plan;
  let selected = product.plans[0]!;
  if (hint === "lifetime") {
    selected =
      product.plans.find((p) => p.durationDays == null) ?? selected;
  } else if (hint === "monthly") {
    selected =
      product.plans.find((p) => p.durationDays != null) ?? selected;
  }

  const tier = tierFromSlug(product.slug);
  const gameSlug = product.game?.slug ?? "util";

  return {
    success: true,
    item: {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      planId: selected.id,
      planLabel: selected.label,
      price: Number(selected.price),
      quantity: 1,
      gameName: product.game?.name ?? "Utility",
      tierLabel: product.type === "CHEAT" ? tier.toUpperCase() : selected.label.toUpperCase(),
      productCode: getProductCode(gameSlug, tier),
    },
  };
}

/** Soft check: customer already has a paid/delivered order containing this product. */
export async function customerOwnsProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  const existing = await db.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ["PAID", "DELIVERED"] },
        paymentStatus: { in: ["PAID"] },
      },
    },
    select: { id: true },
  });
  return !!existing;
}
