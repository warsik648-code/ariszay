import { Check, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DetectionStatus } from "@/types";

const statusConfig: Record<
  DetectionStatus,
  { label: string; className: string; icon: typeof ShieldCheck; dot: string }
> = {
  available: {
    label: "Online",
    className: "border-[rgb(200_255_0_/_0.35)] bg-[rgb(200_255_0_/_0.08)] text-[#c8ff00]",
    icon: ShieldCheck,
    dot: "bg-[#c8ff00]",
  },
  updating: {
    label: "Updating",
    className: "border-[rgb(255_92_0_/_0.4)] bg-[rgb(255_92_0_/_0.08)] text-[#ff5c00]",
    icon: ShieldQuestion,
    dot: "bg-[#ff5c00]",
  },
  unavailable: {
    label: "Offline",
    className: "border-[rgb(255_59_59_/_0.4)] bg-[rgb(255_59_59_/_0.08)] text-[#ff3b3b]",
    icon: ShieldAlert,
    dot: "bg-[#ff3b3b]",
  },
  unknown: {
    label: "Unknown",
    className: "border-[rgb(242_240_235_/_0.2)] bg-[rgb(242_240_235_/_0.05)] text-[rgb(242_240_235_/_0.5)]",
    icon: ShieldOff,
    dot: "bg-[rgb(242_240_235_/_0.4)]",
  },
};

export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: DetectionStatus;
  className?: string;
  compact?: boolean;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 border px-1.5 py-0.5",
          config.className,
          className,
        )}
        title={config.label}
      >
        <span className="relative flex size-1.5">
          {status === "available" && (
            <span
              className={cn(
                "absolute inline-flex size-full animate-ping rounded-none opacity-60",
                config.dot,
              )}
            />
          )}
          <span className={cn("relative inline-flex size-1.5", config.dot)} />
        </span>
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-none px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] uppercase",
        config.className,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {status === "available" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping opacity-60",
              config.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex size-1.5", config.dot)} />
      </span>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

export function FeatureList({
  features,
  className,
}: {
  features: string[];
  className?: string;
}) {
  return (
    <ul className={cn("h-[400px] scrollbar-thin space-y-2 overflow-y-auto pr-2", className)}>
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-[rgb(242_240_235_/_0.75)]">
          <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
