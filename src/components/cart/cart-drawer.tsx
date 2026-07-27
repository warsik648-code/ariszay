"use client";

import { ShoppingCart, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import Link from "next/link";

export function CartDrawer() {
  const { items, removeItem, total } = useCartStore();
  const [open, setOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-none"
          aria-label={`Acquisition module (${itemCount} items)`}
        >
          <ShoppingCart className="size-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center bg-primary font-mono text-[9px] font-bold text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[380px] flex-col gap-0 border-white/10 bg-[#080808] p-0 sm:max-w-[380px]"
      >
        <SheetHeader className="border-b border-white/10 p-5 text-left">
          <p className="tech-label text-primary mb-1">Acquisition module</p>
          <SheetTitle className="font-display text-xl font-bold uppercase tracking-wide text-white">
            Cart · {itemCount} {itemCount === 1 ? "unit" : "units"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <ShoppingCart className="size-10 text-white/20" />
              <p className="tech-label">Empty bay</p>
              <p className="text-sm text-white/40">No modules queued for acquisition.</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-none border-white/15"
                onClick={() => setOpen(false)}
              >
                <Link href="/cheats/the-isle">Browse products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-white/8">
              {items.map((item) => (
                <li key={`${item.productId}-${item.planId}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {item.productCode && (
                        <p className="font-mono text-[9px] tracking-[0.22em] text-white/35 uppercase">
                          {item.productCode}
                        </p>
                      )}
                      <p className="mt-1 font-display text-sm font-semibold uppercase tracking-wide text-white">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] tracking-wide text-white/45 uppercase">
                        {[item.gameName, item.tierLabel, item.planLabel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="mt-2 font-display text-base font-semibold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-none text-white/30 hover:text-red-400"
                      onClick={() => removeItem(item.productId, item.planId)}
                      aria-label={`Remove ${item.productName}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-white/10 p-5">
            <div className="flex items-center justify-between">
              <span className="tech-label">Total</span>
              <span className="font-display text-xl font-bold text-white">
                ${total().toFixed(2)}
              </span>
            </div>
            <Button
              asChild
              className="w-full rounded-none"
              onClick={() => setOpen(false)}
            >
              <Link href="/checkout">
                Proceed to checkout
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
