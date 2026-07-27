"use client";

import { Cloud, Cpu, Palette, Shield } from "lucide-react";

import { ProductPricingRow } from "@/components/marketplace/product-pricing-row";
import type { Product } from "@/types";

const icons = {
  shield: Shield,
  palette: Palette,
  cloud: Cloud,
  cpu: Cpu,
} as const;

const utilityCategory: Record<Product["slug"], string> = {
  ugc: "ACCOUNT TOOL",
  "skin-changer": "COSMETIC",
  "cloud-dma": "INFRASTRUCTURE",
  "hwid-spoofer": "IDENTITY",
};

export function ProductCard({
  product,
}: {
  product: Product;
  viewLabel?: string;
}) {
  const Icon = icons[product.icon];
  const code = `AZ-UTL-${product.slug.slice(0, 3).toUpperCase()}-01`;

  return (
    <article className="ind-panel ind-panel-hover group flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgb(242_240_235_/_0.08)] px-4 py-2.5">
        <span className="font-mono text-[9px] tracking-[0.2em] text-[rgb(242_240_235_/_0.35)] uppercase">
          {code}
        </span>
        <Icon className="size-4 text-primary" />
      </div>
      {product.image ? (
        <a
          href={`/products/${product.slug}`}
          className="relative block aspect-[16/9] overflow-hidden bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </a>
      ) : null}
      <ProductPricingRow
        name={product.name}
        category={utilityCategory[product.slug] ?? "UTILITY"}
        price={product.price}
        href={`/products/${product.slug}`}
        channel="Updated"
        compatibility="Win 10/11"
        categoryColor="#00e5ff"
      />
      <div className="border-t border-[rgb(242_240_235_/_0.08)] px-5 py-4">
        <p className="text-sm text-[rgb(242_240_235_/_0.45)]">{product.description}</p>
      </div>
    </article>
  );
}
