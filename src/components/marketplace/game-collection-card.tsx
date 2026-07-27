import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModuleVisual, SpecChip } from "@/components/shared/industrial-graphics";
import {
  ProductPricingRow,
  getProductCode,
} from "@/components/marketplace/product-pricing-row";
import type { GameWithProducts } from "@/data/marketplace";
import { tierConfig } from "@/data/marketplace";

type Props = {
  game: GameWithProducts;
  index?: number;
};

function displayTierName(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function GameCollectionCard({ game, index = 0 }: Props) {
  const serial = `AZ-COL-${String(index + 1).padStart(2, "0")}`;

  return (
    <article className="ind-panel ind-panel-hover group flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgb(242_240_235_/_0.08)] px-5 py-3">
        <span className="tech-label text-primary">{serial}</span>
        <span className="tech-label">Cheats</span>
      </div>

      <div className="relative">
        <ModuleVisual
          code={game.cheatsSlug.toUpperCase()}
          accent={game.accent}
          label="Cheat Suite"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent p-5 pt-16">
          <h3 className="font-display text-4xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-5xl">
            {game.name} Cheats
          </h3>
          <p className="mt-1 font-mono text-xs tracking-[0.2em] text-[rgb(242_240_235_/_0.4)] uppercase">
            {game.tagline}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-[rgb(242_240_235_/_0.08)]">
        <SpecChip label="Cheats" value={String(game.productCount)} accent />
        <SpecChip label="From" value={`$${game.startingPrice.toFixed(2)}`} />
        <SpecChip label="Status" value="LIVE" />
      </div>

      <div className="flex flex-col divide-y divide-[rgb(242_240_235_/_0.08)]">
        {game.cheats.map((cheat) => {
          const cfg = tierConfig[cheat.tier];
          return (
            <ProductPricingRow
              key={cheat.slug}
              name={displayTierName(cheat.tier)}
              category={cfg.subtitle}
              price={cheat.price}
              href={`/cheats/${game.cheatsSlug}/${cheat.tier}`}
              productCode={getProductCode(cheat.game, cheat.tier)}
              status={cheat.status}
              categoryColor={cfg.color}
              compact
            />
          );
        })}
      </div>

      <div className="mt-auto border-t border-[rgb(242_240_235_/_0.08)] p-5">
        <Button
          asChild
          className="h-11 w-full rounded-none bg-primary font-display text-sm font-bold tracking-[0.15em] text-primary-foreground uppercase hover:bg-[#d4ff33]"
        >
          <Link href={`/games/${game.slug}`}>
            Explore Cheats
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
