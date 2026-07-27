import Link from "next/link";
import { ArrowRight, Package, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { GameWithProducts } from "@/data/marketplace";
import { tierConfig } from "@/data/marketplace";

type Props = {
  game: GameWithProducts;
};

export function GameCollectionCard({ game }: Props) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40">
      {/* Game hero header */}
      <div
        className="relative flex min-h-[140px] flex-col justify-between overflow-hidden p-6"
        style={{
          background: `linear-gradient(135deg, ${game.accent}22 0%, #0d1117 70%)`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute -top-10 -left-10 size-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: game.accent }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.8) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span
              className="inline-block font-mono text-xs tracking-[0.25em] uppercase mb-2"
              style={{ color: game.accent }}
            >
              Gaming Collection
            </span>
            <h3 className="text-2xl font-bold text-white">{game.name}</h3>
            <p className="mt-1 text-sm text-white/50">{game.tagline}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
              <p className="text-xs text-white/40 mb-0.5">From</p>
              <p className="text-xl font-bold text-white">
                ${game.startingPrice.toFixed(2)}
                <span className="text-xs font-normal text-white/40">/mo</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-3 mt-4">
          <span className="flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1 text-xs text-white/60">
            <Package className="size-3.5" />
            {game.productCount} products
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1 text-xs text-white/60">
            <TrendingUp className="size-3.5" />
            Active development
          </span>
        </div>
      </div>

      {/* Product preview grid */}
      <div className="grid grid-cols-3 gap-2 p-5 pt-4">
        {game.cheats.map((cheat) => {
          const cfg = tierConfig[cheat.tier];
          return (
            <Link
              key={cheat.slug}
              href={`/cheats/${game.cheatsSlug}/${cheat.tier}`}
              className="group/card relative flex flex-col gap-1.5 rounded-2xl border border-white/8 bg-white/4 p-3 transition-all hover:border-white/20 hover:bg-white/8"
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${cfg.badgeClass}`}
                >
                  {cfg.label}
                </span>
                <StatusBadge status={cheat.status} compact />
              </div>
              <p className="text-sm font-semibold text-white leading-tight">{cheat.name}</p>
              {cheat.price.monthly != null && (
                <p className="text-xs text-white/50">
                  ${cheat.price.monthly.toFixed(2)}
                  <span className="text-white/30">/mo</span>
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-auto border-t border-white/8 p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-white/40 line-clamp-1">{game.description.split(".")[0]}.</p>
        <Button asChild className="shrink-0 rounded-xl">
          <Link href={`/games/${game.slug}`}>
            Explore Collection
            <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
