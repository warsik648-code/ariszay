import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

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
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { CheatCard } from "@/components/shared/cheat-card";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/components/shared/json-ld";
import { getCheatReferralUrl } from "@/config/ref-links";
import {
  getCheatByGameAndTier,
  getCheatsByGame,
  getFeaturesForCheat,
} from "@/data/cheats";
import { games, getGameByCheatsSlug } from "@/data/games";
import { gameFaqs } from "@/data/faq";
import type { CheatTier } from "@/types";

type PageProps = {
  params: Promise<{ locale: string; gameSlug: string; tier: string }>;
};

const validTiers: CheatTier[] = ["xray", "pro", "private"];

export function generateStaticParams() {
  return games.flatMap((game) =>
    validTiers.map((tier) => ({
      gameSlug: game.cheatsSlug,
      tier,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameSlug, tier } = await params;
  const game = getGameByCheatsSlug(gameSlug);
  if (!game || !validTiers.includes(tier as CheatTier)) return {};

  const cheat = getCheatByGameAndTier(game.slug, tier as CheatTier);
  if (!cheat) return {};

  return {
    title: `${cheat.name} — ${game.name} ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
    description: cheat.description,
    alternates: { canonical: `/cheats/${game.cheatsSlug}/${tier}` },
    openGraph: {
      title: cheat.name,
      description: cheat.description,
    },
  };
}

export default async function CheatDetailPage({ params }: PageProps) {
  const { locale, gameSlug, tier } = await params;
  setRequestLocale(locale);

  const game = getGameByCheatsSlug(gameSlug);
  if (!game) notFound();

  if (!validTiers.includes(tier as CheatTier)) notFound();

  const cheat = getCheatByGameAndTier(game.slug, tier as CheatTier);
  if (!cheat) notFound();

  const features = getFeaturesForCheat(cheat);
  const buyUrl = getCheatReferralUrl(cheat.game, cheat.tier);
  const price = cheat.price.monthly ?? cheat.price.lifetime ?? 0;
  const faqItems = gameFaqs.filter((f) => f.game === game.slug);

  // Other cheats in this game for the "Related" section
  const relatedCheats = getCheatsByGame(game.slug).filter(
    (c) => c.tier !== cheat.tier,
  );

  return (
    <div className="container-site py-10 pb-28 md:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: game.name, path: `/cheats/${game.cheatsSlug}` },
          { name: cheat.name, path: `/cheats/${game.cheatsSlug}/${cheat.tier}` },
        ])}
      />
      <JsonLd
        data={productJsonLd({
          name: cheat.name,
          description: cheat.description,
          path: `/cheats/${game.cheatsSlug}/${cheat.tier}`,
          price,
        })}
      />

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="space-y-8">
          <DetailHero
            breadcrumb={[
              { label: "Home", href: "/" },
              { label: `${game.name} Cheats`, href: `/cheats/${game.cheatsSlug}` },
              { label: cheat.name },
            ]}
            status={cheat.status}
            title={cheat.name}
            description={cheat.description}
          />

          <ImageSliderPlaceholder label={cheat.name} />

          <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 border-l-4 border-l-primary">
            <h2 className="text-lg font-semibold text-white">About this product</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {cheat.description} This product requires Windows 10/11 and is installed
              following the written guide provided after purchase. The availability status
              above reflects the current build compatibility — check before purchasing if
              a recent game update has shipped.
            </p>
            <div className="mt-4 rounded-xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm font-medium text-white/80">Important notice</p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                This software is provided for educational and personal use. You are
                responsible for ensuring compliance with the terms of service of any game
                you use this with.
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Pricing</h2>
            <PricingCards
              price={cheat.price}
              monthlyUrl={cheat.price.monthly != null ? buyUrl : undefined}
              lifetimeUrl={cheat.price.lifetime != null ? buyUrl : undefined}
            />
          </div>

          {faqItems.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">
                {game.shortName} FAQ
              </h2>
              <FaqAccordion items={faqItems} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <HowToGetStarted />
          <WhatsIncluded features={features} featureCount={cheat.featureCount} />
          <SystemRequirementsCard requirements={cheat.systemRequirements} />
        </div>
      </div>

      {/* Feature comparison */}
      <section className="mt-16">
        <SectionHeading
          title="Tier comparison"
          description="Compare all tiers to confirm you have the right package."
        />
        <FeatureComparisonTable gameSlug={game.slug} activeColumn={cheat.tier} />
      </section>

      {/* Related cheats */}
      {relatedCheats.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Other tiers" description={`More options for ${game.name}`} />
          <div className="grid gap-6 md:grid-cols-2">
            {relatedCheats.map((related) => (
              <CheatCard key={related.slug} cheat={related} />
            ))}
          </div>
        </section>
      )}

      <StickyMobileCta
        href={buyUrl}
        label="Buy now"
        priceLabel={
          cheat.price.monthly != null
            ? `$${cheat.price.monthly.toFixed(2)}/mo`
            : `$${cheat.price.lifetime?.toFixed(2)}`
        }
      />
    </div>
  );
}
