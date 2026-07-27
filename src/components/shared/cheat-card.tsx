"use client";

import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { getCheatUrl } from "@/data/cheats";
import { cn } from "@/lib/utils";
import type { Cheat } from "@/types";

const tierLabels: Record<string, string> = {
  xray: "Xray",
  pro: "Pro",
  private: "Private",
};

type CheatCardProps = {
  cheat: Cheat;
  learnMoreLabel?: string;
  moreFeaturesLabel?: string;
  featured?: boolean;
};

export function CheatCard({
  cheat,
  learnMoreLabel = "Learn More",
  moreFeaturesLabel,
  featured = false,
}: CheatCardProps) {
  const remaining = Math.max(
    cheat.featureCount - cheat.highlightFeatures.length,
    0,
  );
  const cheatUrl = getCheatUrl(cheat);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-6 transition-all duration-300",
        "hover:border-white/20 hover:shadow-xl hover:shadow-black/30",
        featured && "border-primary/30 bg-primary/5",
      )}
    >
      {featured && (
        <div className="bg-primary mb-4 inline-flex self-start rounded-full px-3 py-0.5 text-[10px] font-semibold tracking-wider text-black uppercase">
          Most Popular
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
            {tierLabels[cheat.tier] ?? cheat.tier}
          </span>
          <h3 className="mt-1 text-xl font-bold text-white">{cheat.name}</h3>
        </div>
        <StatusBadge status={cheat.status} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/60">
        {cheat.description}
      </p>

      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="text-3xl font-bold text-white">
          {cheat.price.monthly != null ? (
            <>
              ${cheat.price.monthly.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-white/40">/mo</span>
            </>
          ) : (
            "Contact for pricing"
          )}
        </p>
        {cheat.price.lifetime != null && (
          <p className="mt-1 text-sm text-white/40">
            or ${cheat.price.lifetime.toFixed(2)} lifetime
          </p>
        )}
      </div>

      <ul className="mt-5 space-y-2.5">
        {cheat.highlightFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            {feature}
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <p className="mt-3 font-mono text-xs text-white/40">
          {moreFeaturesLabel ?? `+${remaining} more features`}
        </p>
      )}

      <div className="mt-auto pt-5">
        <Button asChild className="w-full rounded-xl">
          <Link href={cheatUrl}>
            {learnMoreLabel}
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
