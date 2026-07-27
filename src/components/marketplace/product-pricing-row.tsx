import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { DetectionStatus, Pricing } from "@/types";

/** Formats a starting price line: "From $14.99 / mo" or "From $49.99". */
export function formatFromPrice(price: Pricing): string {
  if (price.monthly != null) {
    return `From $${price.monthly.toFixed(2)} / mo`;
  }
  if (price.lifetime != null) {
    return `From $${price.lifetime.toFixed(2)}`;
  }
  return "Contact for pricing";
}

export function getProductCode(gameSlug: string, tier: string): string {
  return `AZ-${gameSlug.slice(0, 3).toUpperCase()}-${tier.slice(0, 3).toUpperCase()}-01`;
}

type ProductPricingRowProps = {
  /** Main product heading, e.g. "Xray" or "Isle Xray" */
  name: string;
  /** Category / tier tag beside the name, e.g. "CORE ESP" */
  category: string;
  price: Pricing;
  href: string;
  /** Optional product serial shown above the row */
  productCode?: string;
  status?: DetectionStatus;
  compatibility?: string;
  channel?: string;
  /** Optional color for the category label */
  categoryColor?: string;
  className?: string;
  /** Compact mode for nested lists (collection stacks) */
  compact?: boolean;
};

/**
 * Reusable premium pricing presentation.
 *
 * Layout:
 *   Name          CATEGORY
 *   From $X / mo                         >
 */
export function ProductPricingRow({
  name,
  category,
  price,
  href,
  productCode,
  status,
  compatibility,
  channel,
  categoryColor,
  className,
  compact = false,
}: ProductPricingRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group/price flex items-center gap-4 border border-transparent transition-colors",
        "hover:border-[rgb(200_255_0_/_0.25)] hover:bg-[rgb(200_255_0_/_0.03)]",
        compact ? "px-4 py-3.5" : "px-5 py-5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {(productCode || status || compatibility || channel) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {productCode && (
              <span className="font-mono text-[9px] tracking-[0.22em] text-[rgb(242_240_235_/_0.3)] uppercase">
                {productCode}
              </span>
            )}
            {status && <StatusBadge status={status} compact />}
            {channel && (
              <span className="font-mono text-[9px] tracking-[0.18em] text-[rgb(242_240_235_/_0.35)] uppercase">
                {channel}
              </span>
            )}
            {compatibility && (
              <span className="font-mono text-[9px] tracking-[0.18em] text-[rgb(242_240_235_/_0.35)] uppercase">
                {compatibility}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            className={cn(
              "font-display font-bold tracking-tight text-[#f2f0eb] uppercase",
              compact ? "text-lg" : "text-2xl sm:text-3xl",
            )}
          >
            {name}
          </h3>
          <span
            className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: categoryColor ?? "rgb(242 240 235 / 0.45)" }}
          >
            {category}
          </span>
        </div>

        <p
          className={cn(
            "mt-1.5 font-display font-semibold tracking-tight text-[rgb(242_240_235_/_0.7)]",
            compact ? "text-base" : "text-lg sm:text-xl",
          )}
        >
          {formatFromPrice(price)}
        </p>
      </div>

      <span
        className={cn(
          "flex shrink-0 items-center justify-center border border-[rgb(242_240_235_/_0.12)] text-[rgb(242_240_235_/_0.35)] transition-all",
          "group-hover/price:border-primary group-hover/price:bg-primary group-hover/price:text-primary-foreground",
          compact ? "size-9" : "size-11",
        )}
        aria-hidden
      >
        <ArrowUpRight className={compact ? "size-4" : "size-5"} />
      </span>
    </Link>
  );
}
