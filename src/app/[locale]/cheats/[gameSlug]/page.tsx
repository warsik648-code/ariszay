import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Package, Clock, Shield } from "lucide-react";

import { CheatCard } from "@/components/shared/cheat-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { gameFaqs } from "@/data/faq";
import { getCheatsByGame } from "@/data/cheats";
import { games, getGameByCheatsSlug } from "@/data/games";

type PageProps = {
  params: Promise<{ locale: string; gameSlug: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ gameSlug: game.cheatsSlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameSlug } = await params;
  const game = getGameByCheatsSlug(gameSlug);
  if (!game) return {};
  return {
    title: `${game.name} Cheats — Xray, Pro & Private Tiers`,
    description: `Browse all ArisZay software tiers for ${game.name}. Compare features, pricing, and availability before purchasing.`,
    alternates: { canonical: `/cheats/${game.cheatsSlug}` },
    openGraph: {
      title: `${game.name} Cheats`,
      description: `Software tiers for ${game.name} from ArisZay.`,
    },
  };
}

export default async function CheatCatalogPage({ params }: PageProps) {
  const { locale, gameSlug } = await params;
  setRequestLocale(locale);

  const game = getGameByCheatsSlug(gameSlug);
  if (!game) notFound();

  const cheats = getCheatsByGame(game.slug);
  const faqItems = gameFaqs.filter((f) => f.game === game.slug);

  const deliveryFeatures = [
    {
      icon: Clock,
      title: "Instant delivery",
      description: "License and setup instructions sent immediately after payment confirmation.",
    },
    {
      icon: Package,
      title: "Detailed setup guide",
      description: "Step-by-step written guide included with every license.",
    },
    {
      icon: Shield,
      title: "Status monitoring",
      description: "Product availability is tracked and updated on each product page.",
    },
  ];

  return (
    <div className="container-site py-10 pb-24 md:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cheats", path: `/cheats/${game.cheatsSlug}` },
          { name: game.name, path: `/cheats/${game.cheatsSlug}` },
        ])}
      />

      {/* Hero */}
      <section className="mb-14">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center gap-1.5 text-sm text-white/40">
            <li>
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-white/70">{game.name} Cheats</li>
          </ol>
        </nav>

        <div className="max-w-2xl">
          <span
            className="mb-3 inline-block font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: game.accent }}
          >
            {game.tagline}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {game.name} Cheats
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            {game.description}
          </p>
          <p className="mt-3 text-sm text-white/40">
            All products display a live availability status. Check the status badge on each product before purchasing.
          </p>
        </div>
      </section>

      {/* Product cards */}
      <section className="mb-16">
        <SectionHeading
          title="Choose your tier"
          description="Three tiers available — each unlocking progressively more tools. Compare features below."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {cheats.map((cheat, index) => (
            <CheatCard
              key={cheat.slug}
              cheat={cheat}
              featured={index === 1}
            />
          ))}
        </div>
      </section>

      {/* Delivery info */}
      <section className="mb-16">
        <SectionHeading title="How ordering works" />
        <div className="grid gap-4 sm:grid-cols-3">
          {deliveryFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-[#0d1117] p-5"
            >
              <Icon className="mb-3 size-5 text-white/50" />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mb-16">
        <SectionHeading
          title="Feature comparison"
          description="See exactly what each tier includes before you buy."
        />
        <FeatureComparisonTable gameSlug={game.slug} />
      </section>

      {/* Game overview */}
      <section className="mb-16">
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white">{game.name}</h2>
          <p className="mt-3 leading-relaxed text-white/60">{game.description}</p>
          <div className="mt-5">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={`/games/${game.slug}`}>
                View game overview
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section>
          <SectionHeading title={`${game.shortName} FAQ`} />
          <div className="mx-auto max-w-3xl">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}
    </div>
  );
}
