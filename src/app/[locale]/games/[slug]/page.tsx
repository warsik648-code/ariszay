import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Gamepad2, Shield, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheatCard } from "@/components/shared/cheat-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import { JsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { Link } from "@/i18n/navigation";
import { getCheatsByGame } from "@/data/cheats";
import { gameFaqs } from "@/data/faq";
import { getGame, games } from "@/data/games";

const gameDetails: Record<
  string,
  {
    genre: string;
    developer: string;
    platform: string;
    overview: string[];
    notice: string;
  }
> = {
  isle: {
    genre: "Open-world survival",
    developer: "Afterthought LLC",
    platform: "Windows (Steam)",
    overview: [
      "The Isle is an open-world survival game that pits players as dinosaurs in a persistent multiplayer world. The game runs on two distinct builds: Evrima (the current, actively developed branch) and Legacy (the older build).",
      "ArisZay provides software tools for both builds. Each tool page shows a current availability status — check before purchasing, especially after major game updates.",
    ],
    notice:
      "Availability of products may change with game patches. The status badge on each product page reflects the current state.",
  },
  naraka: {
    genre: "Battle royale / melee combat",
    developer: "24 Entertainment",
    platform: "Windows, Console (Steam / Epic)",
    overview: [
      "Naraka: Bladepoint is a melee-focused battle royale where up to 60 players compete using martial arts, ranged weapons, and grappling hooks.",
      "ArisZay provides enhancement tools for Naraka's competitive environment. All products display a live availability status updated whenever the product state changes.",
    ],
    notice:
      "Naraka receives frequent updates. Always check the product status page before purchasing.",
  },
};

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.name} Software Tools — ArisZay`,
    description: `Browse enhancement tools for ${game.name}. Check availability status, compare tiers, and view system requirements.`,
    alternates: { canonical: `/games/${game.slug}` },
  };
}

export default async function GamePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getGame(slug);
  if (!game) notFound();

  const cheats = getCheatsByGame(game.slug);
  const faqItems = gameFaqs.filter((item) => item.game === game.slug);
  const details = gameDetails[game.slug];

  return (
    <div className="pb-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: game.name, path: `/games/${game.slug}` },
        ])}
      />

      {/* Hero */}
      <section
        className="border-b border-white/10 py-16"
        style={{
          background: `radial-gradient(circle at top left, ${game.accent}20, transparent 50%)`,
        }}
      >
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white/70">Games</li>
              <li aria-hidden>/</li>
              <li className="text-white/70">{game.name}</li>
            </ol>
          </nav>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="max-w-xl">
              <span
                className="mb-3 inline-block font-mono text-xs tracking-[0.2em] uppercase"
                style={{ color: game.accent }}
              >
                Game overview
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {game.name}
              </h1>
              <p className="mt-4 leading-relaxed text-white/60">{game.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl">
                  <Link href={`/cheats/${game.cheatsSlug}`}>
                    View cheats
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {details && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <h2 className="mb-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Game info
                </h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Gamepad2 className="mt-0.5 size-4 shrink-0 text-white/30" />
                    <div>
                      <dt className="text-white/40">Genre</dt>
                      <dd className="text-white/80">{details.genre}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 size-4 shrink-0 text-white/30" />
                    <div>
                      <dt className="text-white/40">Developer</dt>
                      <dd className="text-white/80">{details.developer}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 size-4 shrink-0 text-white/30" />
                    <div>
                      <dt className="text-white/40">Platform</dt>
                      <dd className="text-white/80">{details.platform}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overview */}
      {details && (
        <section className="container-site py-12">
          <div className="max-w-3xl space-y-4">
            {details.overview.map((para, i) => (
              <p key={i} className="leading-relaxed text-white/60">
                {para}
              </p>
            ))}
            <div className="rounded-xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm leading-relaxed text-white/50">
                <strong className="text-white/70">Note:</strong> {details.notice}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Cheat tiers */}
      <section className="container-site py-10">
        <SectionHeading
          title="Available tiers"
          description="Three tiers available — Xray for visibility tools, Pro for competitive assists, Private for the full suite."
          align="left"
        />
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {cheats.map((cheat, index) => (
            <CheatCard key={cheat.slug} cheat={cheat} featured={index === 1} />
          ))}
        </div>
      </section>

      {/* Feature comparison */}
      <section className="container-site py-12">
        <SectionHeading
          title="Feature comparison"
          description="See what each tier includes before purchasing."
          align="left"
        />
        <FeatureComparisonTable gameSlug={game.slug} />
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="container-site py-10">
          <SectionHeading
            title={`${game.shortName} FAQ`}
            align="left"
          />
          <div className="max-w-3xl">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-site py-10">
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to browse?</h2>
          <p className="mt-2 text-white/50">
            Visit the {game.name} cheat catalog to compare tiers and check current availability.
          </p>
          <Button asChild className="mt-5 rounded-xl" size="lg">
            <Link href={`/cheats/${game.cheatsSlug}`}>
              View {game.shortName} cheats
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
