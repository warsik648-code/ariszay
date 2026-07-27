import Link from "next/link";
import { ArrowRight, Check, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { tierConfig } from "@/data/marketplace";
import type { Cheat } from "@/types";
import type { Game } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  cheat: Cheat;
  game: Game;
  featured?: boolean;
};

export function MarketplaceProductCard({ cheat, game, featured = false }: Props) {
  const cfg = tierConfig[cheat.tier] ?? tierConfig.xray;
  const detailUrl = `/cheats/${game.cheatsSlug}/${cheat.tier}`;
  const buyUrl = `/checkout?product=${cheat.game}-${cheat.tier}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0d1117] transition-all duration-300 hover:shadow-xl hover:shadow-black/40",
        featured
          ? "border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/10"
          : "border-white/10 hover:border-white/20",
      )}
    >
      {/* Tier color top bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }}
      />

      {/* Most popular badge */}
      {featured && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
          style={{ background: cfg.glowColor, color: cfg.color, border: `1px solid ${cfg.color}44` }}
        >
          <Zap className="size-2.5" />
          Most Popular
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase",
                  cfg.badgeClass,
                )}
              >
                {cfg.subtitle}
              </span>
              <StatusBadge status={cheat.status} compact />
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{cheat.name}</h3>
            <p className="mt-0.5 text-xs text-white/40">{game.name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
          <div className="flex items-baseline gap-2">
            {cheat.price.monthly != null ? (
              <>
                <span className="text-2xl font-bold text-white">
                  ${cheat.price.monthly.toFixed(2)}
                </span>
                <span className="text-sm text-white/40">/mo</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-white">Contact</span>
            )}
          </div>
          {cheat.price.lifetime != null && (
            <p className="mt-0.5 text-xs text-white/40">
              or ${cheat.price.lifetime.toFixed(2)} lifetime
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-white/55 line-clamp-2">
          {cheat.description}
        </p>

        {/* Features */}
        <ul className="space-y-2">
          {cheat.highlightFeatures.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-white/60">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              {feature}
            </li>
          ))}
          {cheat.featureCount > 4 && (
            <li className="text-xs text-white/30 font-mono">
              +{cheat.featureCount - 4} more features
            </li>
          )}
        </ul>

        {/* CTAs */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-white/10 hover:border-white/20">
            <Link href={detailUrl}>View Details</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link href={buyUrl}>
              Buy Now
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
