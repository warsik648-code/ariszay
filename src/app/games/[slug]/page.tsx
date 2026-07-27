import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Gamepad2, Shield, Globe, Package, TrendingUp, Clock, Headphones } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import { JsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
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
      "ArisZay provides external enhancement tools for The Isle Evrima. Every product shows a current availability status updated within hours of game patches.",
    ],
    notice: "Product availability may change with game updates. Always check the status badge on each product page before purchasing.",
  },
  naraka: {
    genre: "Battle royale / melee combat",
    developer: "24 Entertainment",
    platform: "Windows, Console (Steam / Epic)",
    lastUpdated: "2026",
    overview: [
      "Naraka: Bladepoint is a melee-focused battle royale where players compete using martial arts, ranged weapons, and grappling mechanics.",
      "ArisZay's Naraka tools display real-time availability and are updated to match each game build. Check the status on the product page before purchasing.",
    ],
    notice: "Naraka receives frequent updates. Always verify current product status before purchase.",
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
    title: `${game.name} Cheat Collection — All Products`,
    description: `Browse all ${game.name} enhancement software tiers. Compare Xray, Pro, and Private. Check availability status.`,
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
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: `${game.name} Collection`, path: `/games/${game.slug}` },
      ])} />

      {/* ─── Collection hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-white/10 py-16"
        style={{ background: `radial-gradient(circle at top left, ${game.accent}18, transparent 55%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.8) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div className="container-site relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-sm text-white/40">
              <li><Link href="/" className="hover:text-white/70 transition-colors">Home</Link></li>
              <li aria-hidden>/</li>
              <li className="text-white/70">{game.name} Collection</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Left: game info */}
            <div>
              <span
                className="mb-3 inline-block font-mono text-xs tracking-[0.25em] uppercase"
                style={{ color: game.accent }}
              >
                Game Collection
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {game.name}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/55">
                {game.description}
              </p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Package className="size-4 text-white/40" />
                  <span className="text-sm font-medium text-white">{gp.productCount} products</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <TrendingUp className="size-4 text-white/40" />
                  <span className="text-sm font-medium text-white">From ${gp.startingPrice.toFixed(2)}/mo</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Clock className="size-4 text-white/40" />
                  <span className="text-sm font-medium text-white">Updated {details?.lastUpdated ?? "2026"}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl" size="lg">
                  <Link href={`/cheats/${game.cheatsSlug}/private`}>
                    Get Private (Full Suite)
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl" size="lg">
                  <Link href={`/cheats/${game.cheatsSlug}`}>Compare all tiers</Link>
                </Button>
              </div>
            </div>

            {/* Right: game info card */}
            {details && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 self-start">
                <h2 className="mb-4 text-xs font-semibold tracking-wider uppercase text-white/40">Game info</h2>
                <dl className="space-y-3 text-sm">
                  {[
                    { icon: Gamepad2, label: "Genre", value: details.genre },
                    { icon: Shield, label: "Developer", value: details.developer },
                    { icon: Globe, label: "Platform", value: details.platform },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-white/25" />
                      <div>
                        <dt className="text-xs text-white/35">{label}</dt>
                        <dd className="text-white/75">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {details.notice && (
                  <div className="mt-4 rounded-xl border border-white/8 bg-white/4 p-3">
                    <p className="text-xs leading-relaxed text-white/40">{details.notice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Overview ─────────────────────────────────────────────────── */}
      {details && (
        <section className="container-site py-12 border-b border-white/8">
          <div className="max-w-3xl space-y-3">
            {details.overview.map((para, i) => (
              <p key={i} className="text-white/55 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* ─── All products with filters ────────────────────────────────── */}
      <section className="container-site py-16">
        <SectionHeading
          title={`${game.name} Products`}
          description={`All ${gp.productCount} enhancement tools for ${game.name}. Filter by tier or sort by price.`}
          align="left"
        />
        <GameProductGrid cheats={gp.cheats} games={[game]} showGameFilter={false} />
      </section>

      {/* ─── Feature comparison ───────────────────────────────────────── */}
      <section className="container-site py-16 border-t border-white/8">
        <SectionHeading
          title="Compare all tiers"
          description="Every feature, side by side. See exactly what you're getting before you buy."
          align="left"
        />
        <FeatureComparisonTable gameSlug={game.slug} />
        <div className="mt-6 flex flex-wrap gap-3">
          {gp.cheats.map((cheat) => (
            <Button key={cheat.slug} asChild variant="outline" className="rounded-xl border-white/10">
              <Link href={`/cheats/${game.cheatsSlug}/${cheat.tier}`}>
                View {cheat.name} details
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* ─── Related guides ───────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="container-site py-16 border-t border-white/8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <SectionHeading title={`${game.shortName} guides`} className="mb-0" />
            <Button asChild variant="ghost" size="sm" className="rounded-xl shrink-0">
              <Link href="/blog">All posts <ArrowRight className="ml-1 size-3.5" /></Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1117] p-5 hover:border-white/20 transition-all"
              >
                <p className="font-mono text-[10px] tracking-widest uppercase text-white/30">{post.category}</p>
                <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{post.title}</h3>
                <p className="text-xs text-white/40 line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-white/25 mt-auto">{post.readTimeMinutes} min · {post.publishedAt}</p>
                <Button asChild variant="outline" size="sm" className="rounded-xl border-white/10">
                  <Link href={`/blog/${post.slug}`}>Read guide</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="container-site py-16 border-t border-white/8">
          <SectionHeading title={`${game.shortName} FAQ`} align="left" />
          <div className="max-w-3xl">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}

      {/* ─── Support CTA ──────────────────────────────────────────────── */}
      <section className="container-site py-12 border-t border-white/8">
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Headphones className="size-6 text-white/40" />
              <h2 className="text-xl font-bold text-white">Questions about {game.name} tools?</h2>
              <p className="text-sm text-white/45 leading-relaxed max-w-lg">
                Setup guides are included with every purchase. Check the FAQ above or view the detailed product page for system requirements and delivery information.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end md:justify-center">
              <Button asChild className="rounded-xl">
                <Link href={`/cheats/${game.cheatsSlug}`}>
                  View all tiers
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-white/10">
                <Link href="/#faq">Support FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
