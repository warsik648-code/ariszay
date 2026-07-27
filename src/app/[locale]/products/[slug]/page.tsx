import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { GlassCard } from "@/components/shared/glass-card";
import {
  DetailHero,
  HowToGetStarted,
  ImageSliderPlaceholder,
  PricingCards,
  StickyMobileCta,
  SystemRequirementsCard,
  WhatsIncluded,
} from "@/components/shared/detail-sections";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/components/shared/json-ld";
import { getProductReferralUrl } from "@/config/ref-links";
import { getProduct, productFeatureLists, products } from "@/data/products";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} for Gaming`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = getProduct(slug);
  if (!product) notFound();

  const features = productFeatureLists[product.slug];
  const buyUrl = getProductReferralUrl(product.slug);
  const price = product.price.lifetime ?? product.price.monthly ?? 0;

  return (
    <div className="container-site py-10 pb-28 md:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: `/products/${product.slug}` },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description,
          path: `/products/${product.slug}`,
          price,
        })}
      />

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <DetailHero
            breadcrumb={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products/ugc" },
              { label: product.name },
            ]}
            title={product.name}
            description={product.longDescription}
          />
          <ImageSliderPlaceholder label={product.name} />
          <GlassCard hover={false} className="border-l-indigo border-l-4">
            <h2 className="text-lg font-semibold">About this product</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {product.longDescription}
            </p>
          </GlassCard>
          <div>
            <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
            <PricingCards
              price={product.price}
              lifetimeUrl={product.price.lifetime ? buyUrl : undefined}
              monthlyUrl={product.price.monthly ? buyUrl : undefined}
            />
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <HowToGetStarted />
          <WhatsIncluded
            features={features}
            featureCount={product.featureCount}
          />
          <SystemRequirementsCard requirements={product.systemRequirements} />
        </div>
      </div>

      <StickyMobileCta
        href={buyUrl}
        label="Buy now"
        priceLabel={`$${price.toFixed(2)}`}
      />
    </div>
  );
}
