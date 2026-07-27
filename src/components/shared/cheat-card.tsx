"use client";

import { Check } from "lucide-react";

import {
  ProductPricingRow,
  getProductCode,
} from "@/components/marketplace/product-pricing-row";
import { getCheatUrl } from "@/data/cheats";
import { tierConfig } from "@/data/marketplace";
import { cn } from "@/lib/utils";
import type { Cheat } from "@/types";

type CheatCardProps = {
  cheat: Cheat;
  learnMoreLabel?: string;
  moreFeaturesLabel?: string;
  featured?: boolean;
};

function displayTierName(cheat: Cheat): string {
  return cheat.tier.charAt(0).toUpperCase() + cheat.tier.slice(1);
}

export function CheatCard({
  cheat,
  moreFeaturesLabel,
  featured = false,
}: CheatCardProps) {
  const remaining = Math.max(cheat.featureCount - cheat.highlightFeatures.length, 0);
  const cheatUrl = getCheatUrl(cheat);
  const cfg = tierConfig[cheat.tier] ?? tierConfig.xray;
  const productCode = getProductCode(cheat.game, cheat.tier);

  return (
    <article
      className={cn(
        "ind-panel ind-panel-hover group relative flex flex-col overflow-hidden",
        featured && "border-[rgb(255_92_0_/_0.35)]",
      )}
    >
      {featured && (
        <div className="border-b border-[rgb(255_92_0_/_0.2)] bg-[rgb(255_92_0_/_0.06)] px-5 py-2">
          <span className="font-mono text-[10px] font-semibold tracking-[0.15em] text-[#ff5c00] uppercase">
            Most Popular
          </span>
        </div>
      )}

      {cheat.image ? (
        <a
          href={cheatUrl}
          className="relative block aspect-[16/9] overflow-hidden border-b border-[rgb(242_240_235_/_0.08)] bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cheat.image}
            alt={cheat.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </a>
      ) : null}

      <ProductPricingRow
        name={displayTierName(cheat)}
        category={cfg.subtitle}
        price={cheat.price}
        href={cheatUrl}
        productCode={productCode}
        status={cheat.status}
        channel="Updated"
        compatibility="Win 10/11"
        categoryColor={cfg.color}
      />

      <div className="flex flex-1 flex-col gap-4 border-t border-[rgb(242_240_235_/_0.08)] p-5">
        <p className="text-sm leading-relaxed text-[rgb(242_240_235_/_0.5)]">{cheat.description}</p>

        <ul className="space-y-2">
          {cheat.highlightFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-[rgb(242_240_235_/_0.6)]">
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <p className="font-mono text-[10px] tracking-wider text-[rgb(242_240_235_/_0.3)] uppercase">
            {moreFeaturesLabel ?? `+${remaining} more specs`}
          </p>
        )}
      </div>
    </article>
  );
}
