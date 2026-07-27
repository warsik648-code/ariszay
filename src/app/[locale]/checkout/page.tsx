import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { BuyButton } from "@/components/shared/buy-button";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCheatReferralUrl, getProductReferralUrl } from "@/config/ref-links";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Review selected ArisZay products and continue to secure payment.",
};

const cartItems = [
  {
    id: "isle-private",
    name: "Isle Private Cheat",
    option: "Monthly",
    price: 29.99,
    href: getCheatReferralUrl("isle", "private"),
  },
  {
    id: "hwid-spoofer",
    name: "HWID Spoofer",
    option: "Lifetime",
    price: 34.99,
    href: getProductReferralUrl("hwid-spoofer"),
  },
];

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container-site py-14">
      <SectionHeading
        title="Checkout"
        description="Demo cart — purchases open your configured referral payment links."
      />

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <GlassCard
              key={item.id}
              className="flex items-center justify-between gap-4"
              hover={false}
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-muted-foreground text-sm">{item.option}</p>
              </div>
              <p className="font-mono">${item.price.toFixed(2)}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="h-fit space-y-4" hover={false}>
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fees</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <BuyButton
                key={item.id}
                href={item.href}
                label={`Pay for ${item.name}`}
                className="w-full"
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            Need to keep shopping?{" "}
            <Link href="/games/isle" className="text-primary hover:underline">
              Browse cheats
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
