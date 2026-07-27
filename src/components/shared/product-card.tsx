"use client";

import { Cloud, Cpu, Palette, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types";

const icons = {
  shield: Shield,
  palette: Palette,
  cloud: Cloud,
  cpu: Cpu,
} as const;

export function ProductCard({
  product,
  viewLabel = "View Product",
}: {
  product: Product;
  viewLabel?: string;
}) {
  const Icon = icons[product.icon];
  const price = product.price.lifetime ?? product.price.monthly ?? 0;

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="bg-primary/15 text-primary flex size-12 items-center justify-center rounded-2xl">
        <Icon className="size-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          {product.description}
        </p>
      </div>
      <p className="text-2xl font-bold">${price.toFixed(2)}</p>
      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href={`/products/${product.slug}`}>{viewLabel}</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
