"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketplaceProductCard } from "@/components/marketplace/marketplace-product-card";
import type { Cheat, Game } from "@/types";
import { cn } from "@/lib/utils";

type TierFilter = "all" | "xray" | "pro" | "private";
type SortOption = "featured" | "price-asc" | "price-desc";

type Props = {
  cheats: Cheat[];
  games: Game[];
  showGameFilter?: boolean;
};

const TIER_ORDER: Record<string, number> = { private: 0, pro: 1, xray: 2 };

const tierFilters: { value: TierFilter; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "xray", label: "Xray — Core ESP" },
  { value: "pro", label: "Pro — Aim Assist" },
  { value: "private", label: "Private — Full Suite" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function GameProductGrid({ cheats, games, showGameFilter = false }: Props) {
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [gameFilter, setGameFilter] = useState<string>("all");

  const gameMap = useMemo(
    () => Object.fromEntries(games.map((g) => [g.slug, g])),
    [games],
  );

  const filtered = useMemo(() => {
    let result = [...cheats];

    if (tierFilter !== "all") result = result.filter((c) => c.tier === tierFilter);
    if (showGameFilter && gameFilter !== "all") result = result.filter((c) => c.game === gameFilter);

    result.sort((a, b) => {
      if (sort === "featured") return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
      const aPrice = a.price.monthly ?? a.price.lifetime ?? 999;
      const bPrice = b.price.monthly ?? b.price.lifetime ?? 999;
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });

    return result;
  }, [cheats, tierFilter, sort, gameFilter, showGameFilter]);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-white/30 shrink-0" />

          {showGameFilter && (
            <>
              {["all", ...games.map((g) => g.slug)].map((slug) => {
                const game = games.find((g) => g.slug === slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setGameFilter(slug)}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                      gameFilter === slug
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80",
                    )}
                  >
                    {slug === "all" ? "All Games" : game?.shortName}
                  </button>
                );
              })}
              <span className="h-4 w-px bg-white/10" />
            </>
          )}

          {tierFilters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTierFilter(value)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                tierFilter === value
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/30">Sort:</span>
          <div className="flex gap-1">
            {sortOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  sort === value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-white/30">
        Showing {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cheat) => {
            const game = gameMap[cheat.game];
            if (!game) return null;
            return (
              <MarketplaceProductCard
                key={cheat.slug}
                cheat={cheat}
                game={game}
                featured={cheat.tier === "private"}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-white/40">No products match the selected filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => { setTierFilter("all"); setGameFilter("all"); }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
