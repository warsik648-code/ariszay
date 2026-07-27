import { Check, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DetectionStatus } from "@/types";

const statusConfig: Record<
  DetectionStatus,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  undetected: {
    label: "Undetected",
    className: "border-success/30 bg-success/10 text-success",
    icon: ShieldCheck,
  },
  updating: {
    label: "Updating",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: ShieldQuestion,
  },
  detected: {
    label: "Detected",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: ShieldAlert,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: DetectionStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

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
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
            status === "undetected" && "bg-success",
            status === "updating" && "bg-warning",
            status === "detected" && "bg-destructive",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            status === "undetected" && "bg-success",
            status === "updating" && "bg-warning",
            status === "detected" && "bg-destructive",
          )}
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
