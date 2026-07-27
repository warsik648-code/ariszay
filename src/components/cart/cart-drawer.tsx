"use client";

import { ShoppingCart, X, Minus, Plus, ArrowRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [open, setOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label={`Shopping cart (${itemCount} items)`}
        >
          <ShoppingCart className="size-4" />
          {itemCount > 0 && (
            <Badge className="bg-primary text-primary-foreground absolute -top-1 -right-1 size-4 rounded-full p-0 text-[10px] font-bold flex items-center justify-center">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[360px] flex-col gap-0 border-white/10 bg-[#0a0e1a] p-0"
      >
        <SheetHeader className="border-b border-white/10 p-5">
          <SheetTitle className="text-white">
            Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <ShoppingCart className="size-10 text-white/20" />
              <p className="text-sm text-white/40">Your cart is empty</p>
              <Button asChild variant="outline" size="sm" className="rounded-xl" onClick={() => setOpen(false)}>
                <Link href="/cheats/the-isle">Browse products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-white/8">
              {items.map((item) => (
                <li key={`${item.productId}-${item.planId}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-white/40">{item.planLabel}</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-lg"
                        onClick={() =>
                          updateQuantity(item.productId, item.planId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-4 text-center text-xs font-medium text-white">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-lg"
                        onClick={() =>
                          updateQuantity(item.productId, item.planId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-lg text-white/30 hover:text-white"
                        onClick={() => removeItem(item.productId, item.planId)}
                        aria-label="Remove item"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="font-semibold text-white">${total().toFixed(2)}</span>
            </div>
            <Button
              asChild
              className="w-full rounded-xl"
              onClick={() => setOpen(false)}
            >
              <Link href="/checkout">
                Checkout
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
