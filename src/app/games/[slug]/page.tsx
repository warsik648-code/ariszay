import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Gamepad2, Shield, Globe, Headphones } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import { JsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { IndustrialMesh } from "@/components/shared/industrial-graphics";
import { getGame, games } from "@/data/games";
import { gameFaqs } from "@/data/faq";
import { blogPosts } from "@/data/blog";
import { getGameWithProducts } from "@/data/marketplace";
import { GameProductGrid } from "@/components/marketplace/game-product-grid";

const gameDetails: Record<
  string,
  { genre: string; developer: string; platform: string; overview: string[]; notice: string; lastUpdated: string }
> = {
  isle: {
    genre: "Open-world survival",
    developer: "Afterthought LLC",
    platform: "Windows (Steam)",
    lastUpdated: "2026",
    overview: [
      "The Isle is an open-world survival game set in a persistent multiplayer world where players take the role of dinosaurs competing to survive and grow.",
      "ArisZay provides external enhancement modules for The Isle Evrima. Every unit shows a current availability status updated within hours of game patches.",
    ],
    notice: "Module availability may change with game updates. Always check the status indicator before purchasing.",
  },
  naraka: {
    genre: "Battle royale / melee combat",
    developer: "24 Entertainment",
    platform: "Windows, Console (Steam / Epic)",
    lastUpdated: "2026",
    overview: [
      "Naraka: Bladepoint is a melee-focused battle royale where players compete using martial arts, ranged weapons, and grappling mechanics.",
      "ArisZay's Naraka modules display real-time availability and are revised to match each game build.",
    ],
    notice: "Naraka receives frequent updates. Always verify current module status before purchase.",
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.name} Collection — Technology Modules`,
    description: `Browse all ${game.name} enhancement modules. Compare Xray, Pro, and Private. Check availability status.`,
    alternates: { canonical: `/games/${game.slug}` },
  };
}

export default async function GameCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const gp = getGameWithProducts(slug);
  if (!gp) notFound();

  const details = gameDetails[slug];
  const faqItems = gameFaqs.filter((f) => f.game === slug);
  const relatedPosts = blogPosts.filter((p) => p.game === slug || p.game === "all").slice(0, 3);

  return (
    <div className="pb-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: `${game.name} Collection`, path: `/games/${game.slug}` },
        ])}
      />

      <section className="relative overflow-hidden border-b border-[rgb(242_240_235_/_0.1)] py-20">
        <IndustrialMesh />
        <div className="container-site relative">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-[rgb(242_240_235_/_0.35)] uppercase">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-[rgb(242_240_235_/_0.7)]">{game.name}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <span className="tech-label text-primary mb-3 block">Technology Collection</span>
              <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-7xl">
                {game.name}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[rgb(242_240_235_/_0.5)]">
                {game.description}
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-px border border-[rgb(242_240_235_/_0.1)] bg-[rgb(242_240_235_/_0.1)]">
                {[
                  { k: "Modules", v: String(gp.productCount) },
                  { k: "From", v: `$${gp.startingPrice.toFixed(2)}` },
                  { k: "Rev", v: details?.lastUpdated ?? "2026" },
                ].map(({ k, v }) => (
                  <div key={k} className="bg-[#0a0a0a]/90 px-3 py-3">
                    <p className="tech-label mb-1">{k}</p>
                    <p className="font-display text-xl font-bold uppercase">{v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-11 rounded-none bg-primary px-6 font-display text-sm font-bold tracking-[0.15em] text-primary-foreground uppercase hover:bg-[#d4ff33]"
                >
                  <Link href={`/cheats/${game.cheatsSlug}/private`}>
                    Acquire Private
                    <ArrowUpRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-none border-[rgb(242_240_235_/_0.2)] px-6 font-display text-sm tracking-[0.15em] uppercase"
                >
                  <Link href={`/cheats/${game.cheatsSlug}`}>Compare Modules</Link>
                </Button>
              </div>
            </div>

            {details && (
              <div className="ind-panel h-fit p-5">
                <p className="tech-label mb-4">Facility Data</p>
                <dl className="space-y-4 text-sm">
                  {[
                    { icon: Gamepad2, label: "Genre", value: details.genre },
                    { icon: Shield, label: "Developer", value: details.developer },
                    { icon: Globe, label: "Platform", value: details.platform },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <dt className="tech-label">{label}</dt>
                        <dd className="mt-0.5 text-[rgb(242_240_235_/_0.75)]">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {details.notice && (
                  <div className="mt-5 border border-[rgb(255_92_0_/_0.25)] bg-[rgb(255_92_0_/_0.06)] p-3">
                    <p className="font-mono text-[10px] leading-relaxed tracking-wide text-[#ff5c00] uppercase">
                      {details.notice}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {details && (
        <section className="container-site border-b border-[rgb(242_240_235_/_0.08)] py-12">
          <div className="max-w-3xl space-y-3">
            {details.overview.map((para, i) => (
              <p key={i} className="leading-relaxed text-[rgb(242_240_235_/_0.5)]">
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="container-site py-16">
        <SectionHeading
          index="01"
          label="Modules"
          title={`${game.name} Modules`}
          description={`All ${gp.productCount} enhancement units. Filter by tier or sort by price.`}
        />
        <GameProductGrid cheats={gp.cheats} games={[game]} showGameFilter={false} />
      </section>

      <section className="container-site border-t border-[rgb(242_240_235_/_0.08)] py-16">
        <SectionHeading
          index="02"
          label="Comparison"
          title="Specification Matrix"
          description="Every feature across all tiers — side by side."
        />
        <FeatureComparisonTable gameSlug={game.slug} />
        <div className="mt-6 flex flex-wrap gap-3">
          {gp.cheats.map((cheat) => (
            <Button
              key={cheat.slug}
              asChild
              variant="outline"
              className="rounded-none border-[rgb(242_240_235_/_0.15)] font-display text-xs tracking-wider uppercase"
            >
              <Link href={`/cheats/${game.cheatsSlug}/${cheat.tier}`}>
                {cheat.name} specs
                <ArrowUpRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="container-site border-t border-[rgb(242_240_235_/_0.08)] py-16">
          <SectionHeading index="03" label="Briefings" title={`${game.shortName} Updates`} />
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((post) => (
              <article key={post.slug} className="ind-panel ind-panel-hover flex flex-col p-5">
                <p className="tech-label mb-2">{post.category}</p>
                <h3 className="font-display text-base font-bold uppercase leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-[rgb(242_240_235_/_0.4)]">{post.excerpt}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-auto rounded-none border-[rgb(242_240_235_/_0.12)] font-display text-xs uppercase"
                >
                  <Link href={`/blog/${post.slug}`}>Read</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="container-site border-t border-[rgb(242_240_235_/_0.08)] py-16">
          <SectionHeading index="04" label="FAQ" title={`${game.shortName} FAQ`} />
          <div className="max-w-3xl">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}

      <section className="container-site border-t border-[rgb(242_240_235_/_0.08)] py-12">
        <div className="ind-panel grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="space-y-2">
            <Headphones className="size-5 text-primary" />
            <h2 className="font-display text-2xl font-bold uppercase">
              Questions about {game.name}?
            </h2>
            <p className="max-w-lg text-sm text-[rgb(242_240_235_/_0.45)]">
              Setup guides ship with every license. Check the FAQ or open a module specification sheet.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end md:justify-center">
            <Button
              asChild
              className="rounded-none bg-primary font-display text-xs font-bold tracking-wider text-primary-foreground uppercase"
            >
              <Link href={`/cheats/${game.cheatsSlug}`}>
                View all modules
                <ArrowUpRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-[rgb(242_240_235_/_0.15)] font-display text-xs tracking-wider uppercase"
            >
              <Link href="/#faq">Support FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
