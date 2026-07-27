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
import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCheatReferralUrl } from "@/config/ref-links";
import { cheats, getCheat, getFeaturesForCheat } from "@/data/cheats";
import { getGame } from "@/data/games";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return cheats.map((cheat) => ({ slug: cheat.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cheat = getCheat(slug);
  if (!cheat) return {};
  return {
    title: `${cheat.name} - ESP, Aimbot`,
    description: cheat.description,
  };
}

export default async function CheatDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const cheat = getCheat(slug);
  if (!cheat) notFound();

  const game = getGame(cheat.game);
  const features = getFeaturesForCheat(cheat);
  const buyUrl = getCheatReferralUrl(cheat.game, cheat.tier);
  const price = cheat.price.monthly ?? cheat.price.lifetime ?? 0;

  return (
    <div className="container-site py-10 pb-28 md:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cheats", path: `/games/${cheat.game}` },
          { name: game?.shortName ?? cheat.game, path: `/games/${cheat.game}` },
          { name: cheat.name, path: `/cheats/${cheat.slug}` },
        ])}
      />
      <JsonLd
        data={productJsonLd({
          name: cheat.name,
          description: cheat.description,
          path: `/cheats/${cheat.slug}`,
          price,
        })}
      />

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <DetailHero
            breadcrumb={[
              "Home",
              "Cheats",
              game?.shortName ?? cheat.game,
              cheat.tier,
            ]}
            status={cheat.status}
            title={cheat.name}
            description={cheat.description}
            rating={cheat.rating}
            reviewCount={cheat.reviewCount}
          />

          <ImageSliderPlaceholder label={cheat.name} />

          <GlassCard hover={false} className="border-l-primary border-l-4">
            <h2 className="text-lg font-semibold">About this cheat</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {cheat.description} Built for players who want reliable overlays,
              configurable hotkeys, and a status pipeline that stays current
              with anti-cheat changes. Private customers also unlock stream-safe
              tooling and a direct support channel.
            </p>
          </GlassCard>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
            <PricingCards
              price={cheat.price}
              monthlyUrl={cheat.price.monthly ? buyUrl : undefined}
              lifetimeUrl={cheat.price.lifetime ? buyUrl : undefined}
            />
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <HowToGetStarted />
          <WhatsIncluded
            features={features}
            featureCount={cheat.featureCount}
          />
          <SystemRequirementsCard requirements={cheat.systemRequirements} />
        </div>
      </div>

      <section className="mt-16">
        <SectionHeading
          title="Feature comparison"
          description="See what unlocks as you move from Xray to Private."
        />
        <FeatureComparisonTable />
      </section>

      <StickyMobileCta
        href={buyUrl}
        label="Buy now"
        priceLabel={
          cheat.price.monthly
            ? `$${cheat.price.monthly.toFixed(2)}/mo`
            : `$${cheat.price.lifetime?.toFixed(2)}`
        }
      />
    </div>
  );
}
