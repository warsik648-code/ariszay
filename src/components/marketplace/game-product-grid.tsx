"use client";

import { useMemo, useState } from "react";

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
  { value: "all", label: "All" },
  { value: "xray", label: "Xray" },
  { value: "pro", label: "Pro" },
  { value: "private", label: "Private" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
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
    if (showGameFilter && gameFilter !== "all")
      result = result.filter((c) => c.game === gameFilter);

    result.sort((a, b) => {
      if (sort === "featured") return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);
      const aPrice = a.price.monthly ?? a.price.lifetime ?? 999;
      const bPrice = b.price.monthly ?? b.price.lifetime ?? 999;
      return sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    });
    return result;
  }, [cheats, tierFilter, sort, gameFilter, showGameFilter]);

  const chipClass = (active: boolean) =>
    cn(
      "border px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors",
      active
        ? "border-primary bg-[rgb(200_255_0_/_0.1)] text-primary"
        : "border-[rgb(242_240_235_/_0.12)] text-[rgb(242_240_235_/_0.45)] hover:border-[rgb(242_240_235_/_0.25)] hover:text-[#f2f0eb]",
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border border-[rgb(242_240_235_/_0.1)] bg-[#0e0e0e] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tech-label mr-2">Filter</span>
          {showGameFilter && (
            <>
              {["all", ...games.map((g) => g.slug)].map((slug) => {
                const game = games.find((g) => g.slug === slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setGameFilter(slug)}
                    className={chipClass(gameFilter === slug)}
                  >
                    {slug === "all" ? "All" : game?.shortName}
                  </button>
                );
              })}
              <span className="mx-1 h-4 w-px bg-[rgb(242_240_235_/_0.1)]" />
            </>
          )}
          {tierFilters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTierFilter(value)}
              className={chipClass(tierFilter === value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tech-label">Sort</span>
          {sortOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={chipClass(sort === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-[0.2em] text-[rgb(242_240_235_/_0.3)] uppercase">
        {filtered.length} modules listed
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-[rgb(242_240_235_/_0.15)] py-16 text-center">
          <p className="text-sm text-[rgb(242_240_235_/_0.4)]">No modules match filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-[rgb(242_240_235_/_0.2)]"
            onClick={() => {
              setTierFilter("all");
              setGameFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
