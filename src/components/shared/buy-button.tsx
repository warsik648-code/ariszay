import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BuyButtonProps = {
  href: string;
  label: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
};

export function BuyButton({
  href,
  label,
  className,
  variant = "default",
  size = "default",
}: BuyButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("rounded-xl", className)}
    >
      <Link href={href}>
        {label}
        <ArrowRight className="size-3.5" />
      </Link>
    </Button>
  );
}
