import { Check, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DetectionStatus } from "@/types";

const statusConfig: Record<
  DetectionStatus,
  { label: string; className: string; icon: typeof ShieldCheck; dot: string }
> = {
  available: {
    label: "Available",
    className: "border-success/30 bg-success/10 text-success",
    icon: ShieldCheck,
    dot: "bg-success",
  },
  updating: {
    label: "Updating",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: ShieldQuestion,
    dot: "bg-warning",
  },
  unavailable: {
    label: "Unavailable",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: ShieldAlert,
    dot: "bg-destructive",
  },
  unknown: {
    label: "Status Unknown",
    className: "border-muted/30 bg-muted/10 text-muted-foreground",
    icon: ShieldOff,
    dot: "bg-muted-foreground",
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
          "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
          config.className,
          className,
        )}
        title={config.label}
      >
        <span className="relative flex size-1.5">
          {status === "available" && (
            <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", config.dot)} />
          )}
          <span className={cn("relative inline-flex size-1.5 rounded-full", config.dot)} />
        </span>
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-1 font-medium",
        config.className,
        className,
      )}
    >
      <span className="relative flex size-2">
        {status === "available" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              config.dot,
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-2 rounded-full", config.dot)}
        />
      </span>
      <Icon className="size-3.5" />
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
    <ul
      className={cn(
        "h-[400px] scrollbar-thin space-y-2 overflow-y-auto pr-2",
        className,
      )}
    >
      {features.map((feature) => (
        <li
          key={feature}
          className="text-foreground/90 flex items-start gap-2 text-sm"
        >
          <Check className="text-success mt-0.5 size-4 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
