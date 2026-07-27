import { FeatureList } from "@/components/shared/status-badge";
import { BuyButton } from "@/components/shared/buy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Link } from "@/i18n/navigation";
import type { Cheat, DetectionStatus, Pricing } from "@/types";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

type DetailHeroProps = {
  breadcrumb: BreadcrumbItem[];
  status?: DetectionStatus;
  title: string;
  description: string;
};

export function DetailHero({
  breadcrumb,
  status,
  title,
  description,
}: DetailHeroProps) {
  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-white/40">
          {breadcrumb.map((item, index) => (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-white/70 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/70">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {status ? <StatusBadge status={status} /> : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

export function ImageSliderPlaceholder({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="flex aspect-[16/10] items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-white/30 uppercase">
            Preview
          </p>
          <p className="mt-2 text-lg font-semibold text-white/60">{label}</p>
          <p className="mt-1 text-sm text-white/30">
            Screenshot gallery — add images in the admin panel
          </p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto bg-black/20 p-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 w-20 shrink-0 rounded-xl border border-white/10 bg-white/5"
            aria-hidden
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
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
          <p className="text-sm text-white/50">Monthly subscription</p>
          <p className="text-3xl font-bold text-white">
            ${price.monthly.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-white/40">/mo</span>
          </p>
          <p className="text-xs text-white/40">Cancel anytime</p>
          <BuyButton href={monthlyUrl} label="Select monthly" className="w-full" />
        </div>
      ) : null}
      {price.lifetime != null && lifetimeUrl ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-sm text-white/50">Lifetime access</p>
          <p className="text-3xl font-bold text-white">
            ${price.lifetime.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-white/40"> one-time</span>
          </p>
          <p className="text-xs text-white/40">Pay once, access forever</p>
          <BuyButton href={lifetimeUrl} label="Select lifetime" className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

export function HowToGetStarted() {
  const steps = [
    {
      title: "Create an account",
      body: "Sign up with your email address and Discord username.",
    },
    {
      title: "Select a package",
      body: "Choose your game, tier, and billing duration.",
    },
    {
      title: "Complete payment",
      body: "Checkout securely through our payment partner.",
    },
    {
      title: "Receive your license",
      body: "Setup instructions are sent by email and appear in your account.",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
      <h2 className="text-base font-semibold text-white">How to get started</h2>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/8 font-mono text-xs text-white/60">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-white">{step.title}</p>
              <p className="text-xs text-white/50 mt-0.5">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
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
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">What&apos;s included</h2>
        <span className="font-mono text-xs text-white/40">
          {featureCount} features
        </span>
      </div>
      <FeatureList features={features} />
    </div>
  );
}

export function SystemRequirementsCard({
  requirements,
}: {
  requirements: Cheat["systemRequirements"];
}) {
  const rows: { label: string; value: string }[] = [
    { label: "OS", value: requirements.os },
    { label: "CPU", value: requirements.cpu },
    { label: "RAM", value: requirements.ram },
    { label: "GPU", value: requirements.gpu },
    { label: "Compatible with", value: requirements.compatible },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
      <h2 className="text-base font-semibold text-white">System requirements</h2>
      <dl className="space-y-2.5 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-white/40 shrink-0">{label}</dt>
            <dd className="text-white/80 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
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
        <p className="text-sm font-semibold text-white">{priceLabel}</p>
        <BuyButton href={href} label={label} size="sm" />
      </div>
    </div>
  );
}
