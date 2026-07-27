import { StatusBadge } from "@/components/shared/status-badge";
import { ModuleVisual } from "@/components/shared/industrial-graphics";
import {
  ProductPricingRow,
  getProductCode,
} from "@/components/marketplace/product-pricing-row";
import { tierConfig } from "@/data/marketplace";
import type { Cheat, Game } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  cheat: Cheat;
  game: Game;
  featured?: boolean;
};

function displayTierName(cheat: Cheat): string {
  return cheat.tier.charAt(0).toUpperCase() + cheat.tier.slice(1);
}

export function MarketplaceProductCard({ cheat, game, featured = false }: Props) {
  const cfg = tierConfig[cheat.tier] ?? tierConfig.xray;
  const detailUrl = `/cheats/${game.cheatsSlug}/${cheat.tier}`;
  const productCode = getProductCode(cheat.game, cheat.tier);

  return (
    <article
      className={cn(
        "ind-panel ind-panel-hover group flex flex-col overflow-hidden",
        featured && "border-[rgb(255_92_0_/_0.35)]",
      )}
    >
      <div className="flex items-center justify-between border-b border-[rgb(242_240_235_/_0.08)] px-4 py-2.5">
        <span className="font-mono text-[9px] tracking-[0.2em] text-[rgb(242_240_235_/_0.35)] uppercase">
          {productCode}
        </span>
        <div className="flex items-center gap-2">
          {featured && (
            <span className="font-mono text-[9px] tracking-[0.15em] text-[#ff5c00] uppercase">
              Flagship
            </span>
          )}
          <StatusBadge status={cheat.status} compact />
        </div>
      </div>

      <ModuleVisual code={productCode} accent={cfg.color} label={cfg.subtitle} />

      <ProductPricingRow
        name={displayTierName(cheat)}
        category={cfg.subtitle}
        price={cheat.price}
        href={detailUrl}
        status={cheat.status}
        channel="Release"
        compatibility="Win 10/11"
        categoryColor={cfg.color}
        className="border-t border-[rgb(242_240_235_/_0.08)]"
      />

      <div className="flex flex-1 flex-col gap-3 border-t border-[rgb(242_240_235_/_0.08)] p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)]">
          {cheat.description}
        </p>
        <ul className="space-y-1.5">
          {cheat.highlightFeatures.slice(0, 3).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 font-mono text-[11px] text-[rgb(242_240_235_/_0.5)]"
            >
              <span className="mt-1.5 size-1 shrink-0" style={{ background: cfg.color }} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
