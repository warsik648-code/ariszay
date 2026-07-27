"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Link } from "@/i18n/navigation";
import type { Cheat } from "@/types";

type CheatCardProps = {
  cheat: Cheat;
  learnMoreLabel?: string;
  moreFeaturesLabel?: string;
};

export function CheatCard({
  cheat,
  learnMoreLabel = "Learn More",
  moreFeaturesLabel,
}: CheatCardProps) {
  const remaining = Math.max(
    cheat.featureCount - cheat.highlightFeatures.length,
    0,
  );

  return (
    <GlassCard className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            {cheat.tier}
          </p>
          <h3 className="mt-1 text-xl font-bold">{cheat.name}</h3>
        </div>
        <StatusBadge status={cheat.status} />
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <div className="text-warning flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`size-3.5 ${index < Math.round(cheat.rating) ? "fill-warning" : ""}`}
            />
          ))}
        </div>
        <span>
          {cheat.rating.toFixed(1)} ({cheat.reviewCount})
        </span>
      </div>

      <div>
        <p className="text-foreground text-3xl font-bold">
          ${cheat.price.monthly?.toFixed(2)}
          <span className="text-muted-foreground text-sm font-normal">/mo</span>
        </p>
        {cheat.price.lifetime ? (
          <p className="text-muted-foreground mt-1 text-sm">
            or ${cheat.price.lifetime.toFixed(2)} lifetime
          </p>
        ) : null}
      </div>

      <ul className="text-muted-foreground space-y-2 text-sm">
        {cheat.highlightFeatures.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-primary">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <p className="text-primary font-mono text-xs">
          {moreFeaturesLabel ?? `+${remaining} more features`}
        </p>
      ) : null}

      <div className="mt-auto pt-2">
        <Button asChild className="w-full rounded-xl">
          <Link href={`/cheats/${cheat.slug}`}>{learnMoreLabel}</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
