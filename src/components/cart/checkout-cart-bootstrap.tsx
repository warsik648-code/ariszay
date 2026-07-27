"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { resolveProductForCart } from "@/app/actions/cart";
import { useCartStore } from "@/store/cart";

export type CheckoutBootstrapStatus = "idle" | "loading" | "done" | "error";

/**
 * When landing on /checkout?product=slug&plan=…, ensure that product is in the cart.
 * Safe with empty cart and when adding another product alongside existing lines.
 */
export function CheckoutCartBootstrap({
  onStatus,
}: {
  onStatus?: (status: CheckoutBootstrapStatus) => void;
} = {}) {
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const [message, setMessage] = useState("");
  const ranFor = useRef<string>("");

  useEffect(() => {
    const productSlug = searchParams.get("product");
    if (!productSlug) {
      onStatus?.("idle");
      return;
    }

    const planRaw = searchParams.get("plan");
    const plan =
      planRaw === "monthly" || planRaw === "lifetime" ? planRaw : undefined;
    const key = `${productSlug}:${plan ?? "default"}`;
    if (ranFor.current === key) return;
    ranFor.current = key;

    let cancelled = false;
    onStatus?.("loading");
    (async () => {
      const result = await resolveProductForCart(productSlug, plan);
      if (cancelled) return;
      if (!result.success) {
        setMessage(result.error);
        onStatus?.("error");
        return;
      }
      addItem(result.item);
      setMessage(`Queued ${result.item.productName} (${result.item.planLabel}).`);
      onStatus?.("done");
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally depend on search params only; cart add is idempotent for same plan
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!message) return null;
  return (
    <p className="mb-4 border border-primary/25 bg-[rgb(200_255_0_/_0.06)] px-4 py-2 font-mono text-xs text-primary">
      {message}
    </p>
  );
}
