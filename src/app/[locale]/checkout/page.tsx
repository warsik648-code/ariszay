"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { createOrder } from "@/app/actions/checkout";
import { Link } from "@/i18n/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, couponCode, setCouponCode, referralCode, setReferralCode, clearCart } = useCartStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <ShoppingCart className="size-12 text-white/20" />
        <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
        <p className="text-white/50">Add a product before checking out.</p>
        <Button asChild className="rounded-xl">
          <Link href="/cheats/the-isle">
            Browse cheats
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = await createOrder({
        name,
        email,
        discordUsername: discord || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          planId: item.planId,
          quantity: item.quantity,
        })),
        couponCode: couponCode || undefined,
        referralCode: referralCode || undefined,
        agreeToTerms: agreed,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      clearCart();
      router.push(result.redirectUrl);
    });
  }

  const subtotal = total();

  return (
    <div className="container-site py-12 pb-20">
      <h1 className="mb-8 text-3xl font-bold text-white">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: Customer details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Your details</h2>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-white/70">
                Full name <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="Your name"
                disabled={isPending}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-400">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white/70">
                Email address <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="you@example.com"
                disabled={isPending}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email[0]}</p>
              )}
              <p className="text-xs text-white/30">
                License and delivery instructions are sent to this address.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="discord" className="text-sm font-medium text-white/70">
                Discord username <span className="text-white/30">(optional)</span>
              </label>
              <Input
                id="discord"
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white"
                placeholder="yourname#0000"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Codes</h2>

            <div className="space-y-1.5">
              <label htmlFor="coupon" className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <Tag className="size-3.5" />
                Coupon code
              </label>
              <Input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white font-mono"
                placeholder="DISCOUNT20"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="referral" className="text-sm font-medium text-white/70">
                Referral code <span className="text-white/30">(optional)</span>
              </label>
              <Input
                id="referral"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 text-white font-mono"
                placeholder="Your referral code"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
            <h2 className="mb-4 text-base font-semibold text-white">Order summary</h2>

            <ul className="space-y-3 divide-y divide-white/8">
              {items.map((item) => (
                <li key={`${item.productId}-${item.planId}`} className="pt-3 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{item.productName}</p>
                      <p className="text-xs text-white/40">
                        {item.planLabel} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-white/20 accent-primary"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              disabled={isPending}
            />
            <span className="text-xs leading-relaxed text-white/50">
              I agree to the{" "}
              <Link href="/legal/terms" className="underline hover:text-white/80 transition-colors" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/refund" className="underline hover:text-white/80 transition-colors" target="_blank">
                Refund Policy
              </Link>
              . I understand that prices are validated server-side and the total shown above is final.
            </span>
          </label>

          <Button
            type="submit"
            disabled={isPending || !agreed}
            className="h-12 w-full rounded-xl text-base"
          >
            {isPending ? "Processing…" : "Proceed to payment"}
            {!isPending && <ArrowRight className="ml-1.5 size-5" />}
          </Button>

          <p className="text-center text-xs text-white/30">
            You will be redirected to our payment partner to complete your purchase securely.
          </p>
        </div>
      </form>
    </div>
  );
}
