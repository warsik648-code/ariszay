import { Check, X } from "lucide-react";

import { comparisonMatrix } from "@/data/games";
import { cn } from "@/lib/utils";
import type { CheatTier, GameSlug } from "@/types";

const tierKeys: CheatTier[] = ["xray", "pro", "private"];
const tierLabels: Record<CheatTier, string> = {
  xray: "Xray",
  pro: "Pro",
  private: "Private",
};

type FeatureComparisonTableProps = {
  gameSlug?: GameSlug;
  activeColumn?: CheatTier;
};

export function FeatureComparisonTable({
  activeColumn,
}: FeatureComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1117]">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 font-medium text-white/50 w-1/2">Feature</th>
            {tierKeys.map((tier) => (
              <th
                key={tier}
                className={cn(
                  "px-4 py-4 font-semibold text-center",
                  activeColumn === tier ? "text-primary" : "text-white/70",
                )}
              >
                {tierLabels[tier]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonMatrix.map((row, index) => (
            <tr
              key={row.feature}
              className={cn(
                "border-b border-white/5",
                index % 2 === 0 && "bg-white/[0.02]",
              )}
            >
              <td className="px-6 py-3 text-white/80">{row.feature}</td>
              {tierKeys.map((tier) => (
                <td
                  key={tier}
                  className={cn(
                    "px-4 py-3 text-center",
                    activeColumn === tier && "bg-primary/5",
                  )}
                >
                  <BoolIcon value={row[tier]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="size-4 text-emerald-400 mx-auto" />
  ) : (
    <X className="size-4 text-white/20 mx-auto" />
  );
}
