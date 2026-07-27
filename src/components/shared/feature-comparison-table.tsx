import { Check, X } from "lucide-react";

import { comparisonMatrix } from "@/data/games";
import { GlassCard } from "@/components/shared/glass-card";

export function FeatureComparisonTable() {
  return (
    <GlassCard hover={false} className="overflow-x-auto p-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-white/10">
            <th className="px-6 py-4 font-medium">Feature</th>
            <th className="px-4 py-4 font-medium">Xray</th>
            <th className="px-4 py-4 font-medium">Pro</th>
            <th className="px-4 py-4 font-medium">Private</th>
          </tr>
        </thead>
        <tbody>
          {comparisonMatrix.map((row) => (
            <tr key={row.feature} className="border-b border-white/5">
              <td className="px-6 py-3">{row.feature}</td>
              <td className="px-4 py-3">
                <BoolIcon value={row.xray} />
              </td>
              <td className="px-4 py-3">
                <BoolIcon value={row.pro} />
              </td>
              <td className="px-4 py-3">
                <BoolIcon value={row.private} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="text-success size-4" />
  ) : (
    <X className="text-muted-foreground/50 size-4" />
  );
}
