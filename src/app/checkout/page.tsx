"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight, Tag, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { createOrder } from "@/app/actions/checkout";
import { customerOwnsProduct } from "@/app/actions/cart";
import { useSession } from "@/lib/auth-client";
import { CheckoutCartBootstrap } from "@/components/cart/checkout-cart-bootstrap";
import {
  giftCardsForTotal,
  REWARBLE_PAYMENT_METHOD,
} from "@/lib/payments/rewarble";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container-site py-12">
      <div className="h-8 w-48 animate-pulse bg-white/10" />
    </div>
  );
}

function CheckoutPageInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, couponCode, setCouponCode, referralCode, setReferralCode, clearCart, removeItem } =
    useCartStore();

  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [paymentMethod] = useState(REWARBLE_PAYMENT_METHOD);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [ownWarning, setOwnWarning] = useState("");
  const [bootstrapStatus, setBootstrapStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (session?.user) {
      setEmail((prev) => prev || session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.user?.id || items.length === 0) {
        setOwnWarning("");
        return;
      }
      for (const item of items) {
        const owns = await customerOwnsProduct(session.user.id, item.productId);
        if (cancelled) return;
        if (owns) {
          setOwnWarning(
            `You already have an active paid order that includes ${item.productName}. You can still purchase again if you need another license.`,
          );
          return;
        }
      }
      setOwnWarning("");
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, items]);

  if (items.length === 0) {
    const resolving = bootstrapStatus === "loading";
    return (
      <div className="container-site py-12 pb-20">
        <CheckoutCartBootstrap onStatus={setBootstrapStatus} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
          <ShoppingCart className="size-12 text-white/20" />
          <h1 className="font-display text-2xl font-bold uppercase text-white">
            {resolving ? "Loading acquisition…" : "Acquisition bay empty"}
          </h1>
          <p className="max-w-md text-sm text-white/50">
            {resolving
              ? "Resolving product from link and adding it to your cart."
              : "No modules in cart yet. Open a product and click Buy Now."}
          </p>
          {!resolving && (
            <Button asChild className="rounded-none">
              <Link href="/cheats/the-isle">
                Browse cheats
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          )}
          {!session?.user && !resolving && (
            <p className="text-xs text-white/35">
              Checkout as a guest, or{" "}
              <Link href="/auth/sign-in?redirect=/checkout" className="text-primary underline">
                sign in
              </Link>{" "}
              for order tracking and support in your account.
            </p>
          )}
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = await createOrder({
        email: email.trim() || undefined,
        discordUsername: discord,
        giftCardCode,
        paymentMethod: REWARBLE_PAYMENT_METHOD,
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
  const giftCards = giftCardsForTotal(subtotal);

  return (
    <div className="container-site py-12 pb-20">
      <CheckoutCartBootstrap onStatus={setBootstrapStatus} />
      <div className="mb-8">
        <p className="tech-label text-primary mb-2">Acquisition</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Checkout</h1>
        {!session?.user && (
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Checkout as a guest or{" "}
            <Link href="/auth/sign-in?redirect=/checkout" className="text-primary underline">
              sign in
            </Link>{" "}
            for a better experience. Signed-in customers get access to order tracking, support
            history, and account management.
          </p>
        )}
      </div>

      {ownWarning && (
        <div className="mb-6 border border-yellow-500/25 bg-yellow-500/8 px-4 py-3 text-sm text-yellow-200">
          {ownWarning}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="ind-panel space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold uppercase text-white">Contact</h2>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white/70">
                Email address{" "}
                <span className="text-white/30">(optional)</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-none border-white/10 bg-black/20 text-white"
                placeholder="you@example.com"
                disabled={isPending}
              />
              <p className="text-xs text-white/35">
                Optional — if provided, we can use it for order updates.
              </p>
              {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email[0]}</p>}
            </div>
          </div>

          <div className="ind-panel space-y-5 p-6">
            <p className="tech-label text-primary">Payment terminal</p>
            <h2 className="font-display text-lg font-semibold uppercase text-white">Payment method</h2>

            <label className="flex cursor-pointer items-start gap-3 border border-primary/40 bg-[rgb(200_255_0_/_0.05)] p-4">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === REWARBLE_PAYMENT_METHOD}
                readOnly
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-white">Rewarble Visa Gift Card</span>
                <span className="mt-0.5 block text-xs text-white/45">
                  Purchase on G2A, then submit your card code for verification. Orders are not marked paid until reviewed.
                </span>
              </span>
            </label>

            <div className="space-y-4 border-t border-white/10 pt-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">Step 1</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Purchase a Rewarble Visa Gift Card</h3>
                <p className="mt-1 text-xs text-white/45">
                  Buy a gift card that matches your order total (${subtotal.toFixed(2)}).
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {giftCards.map((card) => (
                    <Button key={card.amount} asChild variant="outline" className="rounded-none border-white/20">
                      <a href={card.url} target="_blank" rel="noopener noreferrer">
                        {card.label}
                        <ExternalLink className="ml-1.5 size-3.5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">Step 2</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Enter your card code</h3>
                <p className="mt-1 text-xs text-white/45">
                  Copy the promo/gift card code from your G2A purchase and paste it below.
                </p>
                <Input
                  id="giftCardCode"
                  type="text"
                  required
                  autoComplete="off"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                  className="mt-3 h-11 rounded-none border-white/10 bg-black/20 font-mono tracking-widest text-white"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  disabled={isPending}
                />
                {fieldErrors.giftCardCode && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.giftCardCode[0]}</p>
                )}
              </div>

              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">Step 3</p>
                <h3 className="mt-1 text-sm font-semibold text-white">Enter Discord username</h3>
                <Input
                  id="discord"
                  type="text"
                  required
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="mt-3 h-11 rounded-none border-white/10 bg-black/20 text-white"
                  placeholder="username#0000"
                  disabled={isPending}
                />
                {fieldErrors.discordUsername && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.discordUsername[0]}</p>
                )}
              </div>
            </div>
          </div>

          <div className="ind-panel space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold uppercase text-white">Codes</h2>
            <div className="space-y-1.5">
              <label htmlFor="coupon" className="flex items-center gap-1.5 text-sm font-medium text-white/70">
                <Tag className="size-3.5" /> Coupon code
              </label>
              <Input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-11 rounded-none border-white/10 bg-black/20 font-mono text-white"
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
                className="h-11 rounded-none border-white/10 bg-black/20 font-mono text-white"
                placeholder="Referral code"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="ind-panel p-5">
            <p className="tech-label mb-3">Module bay</p>
            <h2 className="mb-4 font-display text-base font-semibold uppercase text-white">Order summary</h2>
            <ul className="space-y-3 divide-y divide-white/8">
              {items.map((item) => (
                <li key={`${item.productId}-${item.planId}`} className="pt-3 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {item.productCode && (
                        <p className="font-mono text-[9px] tracking-[0.2em] text-white/35 uppercase">
                          {item.productCode}
                        </p>
                      )}
                      <p className="text-sm font-medium text-white">{item.productName}</p>
                      <p className="text-xs text-white/40">
                        {[item.gameName, item.tierLabel, item.planLabel].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        className="mt-1 font-mono text-[10px] tracking-wider text-white/35 uppercase hover:text-red-400"
                        onClick={() => removeItem(item.productId, item.planId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span className="text-white">Total</span>
                <span className="text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 border border-red-500/20 bg-red-500/10 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              disabled={isPending}
            />
            <span className="text-xs leading-relaxed text-white/50">
              I agree to the{" "}
              <Link href="/legal/terms" className="underline hover:text-white/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/refund" className="underline hover:text-white/80">
                Refund Policy
              </Link>
              .
            </span>
          </label>

          <Button
            type="submit"
            disabled={isPending || !agreed}
            className="h-12 w-full rounded-none text-base"
          >
            {isPending ? "Submitting…" : "Submit & Place Order"}
            {!isPending && <ArrowRight className="ml-1.5 size-5" />}
          </Button>
          <p className="text-center text-[11px] text-white/35">
            Payment stays Pending Verification until an admin approves your code.
          </p>
        </div>
      </form>
    </div>
  );
}
