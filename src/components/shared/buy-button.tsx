"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveProductForCart } from "@/app/actions/cart";
import { parseCheckoutProductHref, useCartStore } from "@/store/cart";

type BuyButtonProps = {
  /** Preferred: `/checkout?product=slug&plan=monthly|lifetime` */
  href?: string;
  productSlug?: string;
  plan?: "monthly" | "lifetime";
  label: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  /** After add: go to checkout (default) or stay */
  mode?: "checkout" | "cart";
};

export function BuyButton({
  href,
  productSlug: productSlugProp,
  plan: planProp,
  label,
  className,
  variant = "default",
  size = "default",
  mode = "checkout",
}: BuyButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function resolveSlugPlan(): { productSlug: string; plan?: "monthly" | "lifetime" } | null {
    if (productSlugProp) return { productSlug: productSlugProp, plan: planProp };
    if (href) return parseCheckoutProductHref(href);
    return null;
  }

  function onClick() {
    setError("");
    const target = resolveSlugPlan();
    if (!target) {
      setError("Product unavailable.");
      return;
    }

    startTransition(async () => {
      const result = await resolveProductForCart(target.productSlug, target.plan);
      if (!result.success) {
        setError(result.error);
        return;
      }
      addItem(result.item);
      if (mode === "checkout") {
        // Keep query params so checkout bootstrap can re-hydrate if storage lags
        const qs = new URLSearchParams({ product: result.item.productSlug });
        if (target.plan) qs.set("plan", target.plan);
        router.push(`/checkout?${qs.toString()}`);
      }
    });
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className?.includes("w-full") && "w-full")}>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={pending}
        onClick={onClick}
        className={cn("rounded-xl", className)}
      >
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Adding…
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="size-3.5" />
          </>
        )}
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
