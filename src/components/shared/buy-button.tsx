"use client";

import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => toast.success("Opening secure checkout…")}
      >
        {label}
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
  );
}
