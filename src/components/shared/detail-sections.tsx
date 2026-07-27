import { FeatureList } from "@/components/shared/status-badge";
import { GlassCard } from "@/components/shared/glass-card";
import { BuyButton } from "@/components/shared/buy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Cheat, DetectionStatus, Pricing } from "@/types";
import { Star } from "lucide-react";

type DetailHeroProps = {
  breadcrumb: string[];
  status?: DetectionStatus;
  title: string;
  description: string;
  rating?: number;
  reviewCount?: number;
};

export function DetailHero({
  breadcrumb,
  status,
  title,
  description,
  rating,
  reviewCount,
}: DetailHeroProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{breadcrumb.join(" › ")}</p>
      {status ? <StatusBadge status={status} /> : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground max-w-2xl">{description}</p>
      {rating != null && reviewCount != null ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <div className="text-warning flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${i < Math.round(rating) ? "fill-warning" : ""}`}
              />
            ))}
          </div>
          <span>
            {rating.toFixed(1)}/5 · {reviewCount} reviews
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function ImageSliderPlaceholder({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <div className="from-primary/25 to-indigo/20 flex aspect-[16/10] items-center justify-center bg-gradient-to-br via-[#1a1f2e]">
        <div className="text-center">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            Preview
          </p>
          <p className="mt-2 text-lg font-semibold">{label}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Screenshot gallery slot
          </p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto bg-black/20 p-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 w-20 shrink-0 rounded-xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

export function PricingCards({
  price,
  monthlyUrl,
  lifetimeUrl,
}: {
  price: Pricing;
  monthlyUrl?: string;
  lifetimeUrl?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {price.monthly != null && monthlyUrl ? (
        <GlassCard className="space-y-3" hover={false}>
          <p className="text-muted-foreground text-sm">Monthly</p>
          <p className="text-3xl font-bold">
            ${price.monthly.toFixed(2)}
            <span className="text-muted-foreground text-sm font-normal">
              /mo
            </span>
          </p>
          <BuyButton href={monthlyUrl} label="Select" className="w-full" />
        </GlassCard>
      ) : null}
      {price.lifetime != null && lifetimeUrl ? (
        <GlassCard className="space-y-3" hover={false}>
          <p className="text-muted-foreground text-sm">Lifetime</p>
          <p className="text-3xl font-bold">
            ${price.lifetime.toFixed(2)}
            <span className="text-muted-foreground text-sm font-normal">
              {" "}
              one-time
            </span>
          </p>
          <BuyButton href={lifetimeUrl} label="Select" className="w-full" />
        </GlassCard>
      ) : null}
    </div>
  );
}

export function HowToGetStarted() {
  const steps = [
    { title: "Create Account", body: "Sign up for free" },
    { title: "Select Package", body: "Choose your tier" },
    { title: "Complete Payment", body: "Secure checkout" },
    { title: "Download & Play", body: "Instant delivery" },
  ];

  return (
    <GlassCard hover={false} className="space-y-4">
      <h2 className="text-lg font-semibold">How to get started</h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm">
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-muted-foreground text-sm">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </GlassCard>
  );
}

export function WhatsIncluded({
  features,
  featureCount,
}: {
  features: string[];
  featureCount: number;
}) {
  return (
    <GlassCard hover={false} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">What&apos;s included</h2>
        <span className="text-primary font-mono text-xs">
          {featureCount}+ features
        </span>
      </div>
      <FeatureList features={features} />
    </GlassCard>
  );
}

export function SystemRequirementsCard({
  requirements,
}: {
  requirements: Cheat["systemRequirements"];
}) {
  return (
    <GlassCard hover={false} className="space-y-3">
      <h2 className="text-lg font-semibold">System requirements</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">OS</dt>
          <dd>{requirements.os}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">CPU</dt>
          <dd>{requirements.cpu}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">RAM</dt>
          <dd>{requirements.ram}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">GPU</dt>
          <dd>{requirements.gpu}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Compatible</dt>
          <dd className="text-right">{requirements.compatible}</dd>
        </div>
      </dl>
    </GlassCard>
  );
}

export function StickyMobileCta({
  href,
  label,
  priceLabel,
}: {
  href: string;
  label: string;
  priceLabel: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0e1a]/95 p-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{priceLabel}</p>
        <BuyButton href={href} label={label} size="sm" />
      </div>
    </div>
  );
}
