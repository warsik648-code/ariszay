import {
  ArrowUpRight,
  Cpu,
  Shield,
  CloudCog,
  Paintbrush,
  Zap,
  Radio,
  Gauge,
  Boxes,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { IndustrialMesh } from "@/components/shared/industrial-graphics";
import { blogPosts } from "@/data/blog";
import { faqs } from "@/data/faq";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { getAllGamesWithProducts } from "@/data/marketplace";
import { JsonLd, organizationJsonLd } from "@/components/shared/json-ld";
import NewsletterForm from "@/components/shared/newsletter-form";
import { GameCollectionCard } from "@/components/marketplace/game-collection-card";
import { MarketplaceProductCard } from "@/components/marketplace/marketplace-product-card";
import { ProductPricingRow } from "@/components/marketplace/product-pricing-row";

const utilityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  palette: Paintbrush,
  cloud: CloudCog,
  cpu: Cpu,
};

export default function HomePage() {
  const gamesWithProducts = getAllGamesWithProducts();
  const allCheats = gamesWithProducts.flatMap((g) => g.cheats);
  const latestPosts = blogPosts.slice(0, 3);
  const totalProducts = allCheats.length;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      {/* ─── HERO: one composition — brand, headline, support, CTA, visual plane ─── */}
      <section className="relative min-h-[92vh] overflow-hidden border-b border-[rgb(242_240_235_/_0.1)]">
        <IndustrialMesh className="animate-grid-shift" />

        <div className="container-site relative flex min-h-[92vh] flex-col justify-end pb-16 pt-28 sm:pb-24 sm:pt-32">
          <FadeIn className="max-w-4xl">
            <p className="font-display mb-4 text-5xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-7xl lg:text-8xl">
              Aris<span className="text-primary">Zay</span>
            </p>
            <h1 className="font-display max-w-3xl text-3xl font-bold tracking-tight text-[rgb(242_240_235_/_0.85)] uppercase sm:text-5xl lg:text-6xl">
              Premium game cheats, ESP &amp; aimbot software
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[rgb(242_240_235_/_0.5)] sm:text-lg">
              Buy The Isle and Naraka cheats — Xray ESP, Pro aim assist, and Private aimbot. Instant delivery. Live status on every product.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-primary px-8 font-display text-sm font-bold tracking-[0.18em] text-primary-foreground uppercase hover:bg-[#d4ff33]"
              >
                <Link href={`/games/${games[0].slug}`}>
                  Browse Cheats
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-none border-[rgb(242_240_235_/_0.2)] bg-transparent px-8 font-display text-sm tracking-[0.18em] uppercase hover:border-primary hover:bg-transparent hover:text-primary"
              >
                <Link href={`/cheats/${games[0].cheatsSlug}`}>View Isle Cheats</Link>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-14 grid grid-cols-2 gap-px border border-[rgb(242_240_235_/_0.1)] bg-[rgb(242_240_235_/_0.1)] sm:grid-cols-4">
            {[
              { k: "Cheats", v: String(totalProducts) },
              { k: "Games", v: String(gamesWithProducts.length) },
              { k: "Delivery", v: "Instant" },
              { k: "Status", v: "Live" },
            ].map(({ k, v }) => (
              <div key={k} className="bg-[#0a0a0a]/90 px-4 py-4 backdrop-blur-sm">
                <p className="tech-label mb-1">{k}</p>
                <p className="font-display text-2xl font-bold tracking-tight text-[#f2f0eb] uppercase">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Collections ─── */}
      <section className="container-site py-24">
        <SectionHeading
          index="01"
          label="Game Cheats"
          title="Cheat Collections"
          description="Browse ESP, aim assist, and private aimbot cheats by game. Every tier is a separate product you can buy."
        />
        <StaggerChildren className="grid gap-6 lg:grid-cols-2">
          {gamesWithProducts.map((game, i) => (
            <StaggerItem key={game.slug}>
              <GameCollectionCard game={game} index={i} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ─── Featured Technology ─── */}
      <section className="border-y border-[rgb(242_240_235_/_0.08)] bg-[#0a0a0a] py-24">
        <div className="container-site">
          <SectionHeading
            index="02"
            label="Featured Cheats"
            title="ESP, Aim Assist &amp; Aimbot"
            description="Every cheat tier across both games — Xray ESP, Pro aim, and Private aimbot."
          />
          {gamesWithProducts.map((gp) => (
            <div key={gp.slug} className="mb-16 last:mb-0">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="h-8 w-1 bg-primary" />
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-tight uppercase">
                      {gp.name} Cheats
                    </h3>
                    <p className="font-mono text-[10px] tracking-[0.25em] text-[rgb(242_240_235_/_0.35)] uppercase">
                      {gp.productCount} cheats · from ${gp.startingPrice.toFixed(2)}/mo
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none border-[rgb(242_240_235_/_0.15)] font-mono text-[10px] tracking-[0.15em] uppercase"
                >
                  <Link href={`/games/${gp.slug}`}>
                    All {gp.shortName} cheats
                    <ArrowUpRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gp.cheats.map((cheat) => (
                  <MarketplaceProductCard
                    key={cheat.slug}
                    cheat={cheat}
                    game={gp}
                    featured={cheat.tier === "private"}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Utility storefront — restored when UTILITY_STOREFRONT_ENABLED is true */}
      {products.length > 0 ? (
        <section className="container-site py-24">
          <SectionHeading
            index="03"
            label="Products"
            title="Utility Tools &amp; Hacks"
            description="Account tools, spoofers, skin changers, and DMA utilities that pair with your cheats."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => {
              const Icon = utilityIconMap[product.icon] ?? Shield;
              const categories: Record<string, string> = {
                ugc: "ACCOUNT TOOL",
                "skin-changer": "COSMETIC",
                "cloud-dma": "INFRASTRUCTURE",
                "hwid-spoofer": "IDENTITY",
              };
              return (
                <article
                  key={product.slug}
                  className="ind-panel ind-panel-hover group flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[rgb(242_240_235_/_0.08)] px-4 py-2.5">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-[rgb(242_240_235_/_0.35)] uppercase">
                      AZ-UTL-{String(i + 1).padStart(2, "0")}
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
                    category={categories[product.slug] ?? "UTILITY"}
                    price={product.price}
                    href={`/products/${product.slug}`}
                    channel="Stable"
                    compatibility="Win 10/11"
                    categoryColor="#00e5ff"
                  />
                  <div className="flex flex-1 flex-col gap-3 border-t border-[rgb(242_240_235_/_0.08)] p-5">
                    <p className="text-sm text-[rgb(242_240_235_/_0.45)]">{product.description}</p>
                    <ul className="mt-auto space-y-1.5">
                      {product.highlightFeatures.slice(0, 3).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 font-mono text-[11px] text-[rgb(242_240_235_/_0.5)]"
                        >
                          <span className="size-1 bg-cyan" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ─── Technical Specifications / How it works ─── */}
      <section className="border-y border-[rgb(242_240_235_/_0.08)] bg-[#0a0a0a] py-24">
        <div className="container-site">
          <SectionHeading
            index={products.length > 0 ? "04" : "03"}
            label="How it works"
            title="How to buy cheats"
            description="From picking your ESP or aimbot tier to launching in-game."
          />
          <div className="grid gap-px border border-[rgb(242_240_235_/_0.1)] bg-[rgb(242_240_235_/_0.1)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: "01",
                icon: Boxes,
                title: "Choose a cheat",
                body: "Pick The Isle or Naraka. Compare Xray ESP, Pro aim assist, and Private aimbot.",
              },
              {
                num: "02",
                icon: Gauge,
                title: "Checkout secure",
                body: "Pay monthly or lifetime. Cards, crypto, and regional methods supported.",
              },
              {
                num: "03",
                icon: Radio,
                title: "Get your key",
                body: "License and setup guide sent to email and your account dashboard.",
              },
              {
                num: "04",
                icon: Zap,
                title: "Launch & play",
                body: "Follow the guide. Support included — Private customers get a direct channel.",
              },
            ].map(({ num, icon: Icon, title, body }) => (
              <div key={num} className="relative bg-[#0e0e0e] p-6">
                <span className="font-display absolute top-4 right-4 text-4xl font-extrabold text-[rgb(242_240_235_/_0.04)]">
                  {num}
                </span>
                <Icon className="mb-5 size-5 text-primary" />
                <h3 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Advantages ─── */}
      <section className="container-site py-24">
        <SectionHeading
          index={products.length > 0 ? "05" : "04"}
          label="Why ArisZay"
          title="Why buy cheats here"
          description="Built for players who want clear status, fast delivery, and real support."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Live cheat status",
              body: "Each ESP and aimbot page shows current availability — updated after game patches.",
            },
            {
              title: "Instant delivery",
              body: "License key and setup guide sent right after payment confirmation.",
            },
            {
              title: "Setup support",
              body: "Guides included with every cheat. Private aimbot buyers get a direct support channel.",
            },
            {
              title: "Secure checkout",
              body: "Cards, crypto, and regional payment methods through trusted partners.",
            },
          ].map((item, i) => (
            <div key={item.title} className="ind-panel p-6">
              <span className="font-mono text-[10px] tracking-[0.25em] text-primary">
                ADV-{String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-3 text-xl font-bold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Latest Updates ─── */}
      <section className="border-t border-[rgb(242_240_235_/_0.08)] bg-[#0a0a0a] py-24">
        <div className="container-site">
          <div className="mb-10 flex items-end justify-between gap-4">
            <SectionHeading
              index={products.length > 0 ? "06" : "05"}
              label="Guides"
              title="Cheat guides &amp; updates"
              className="mb-0"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 rounded-none border-[rgb(242_240_235_/_0.15)] font-mono text-[10px] tracking-[0.15em] uppercase"
            >
              <Link href="/blog">
                All guides
                <ArrowUpRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {latestPosts.map((post, i) => (
              <article key={post.slug} className="ind-panel ind-panel-hover flex flex-col">
                <div className="flex h-28 items-end border-b border-[rgb(242_240_235_/_0.08)] bg-[#0c0c0c] p-4 blueprint-grid">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-primary uppercase">
                    {post.category} · BRF-{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-display text-lg font-bold leading-snug uppercase line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-[rgb(242_240_235_/_0.4)]">{post.excerpt}</p>
                  <p className="mt-auto font-mono text-[10px] text-[rgb(242_240_235_/_0.25)] uppercase">
                    {post.readTimeMinutes} min · {post.publishedAt}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-none border-[rgb(242_240_235_/_0.12)] font-display text-xs tracking-wider uppercase"
                  >
                    <Link href={`/blog/${post.slug}`}>Read guide</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="container-site scroll-mt-24 py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            <SectionHeading
              index={products.length > 0 ? "07" : "06"}
              label="FAQ"
              title="Cheat FAQ"
              className="mb-0"
            />
            <div className="max-w-3xl">
              <FaqAccordion items={faqs} />
            </div>
          </div>
          <aside className="ind-panel h-fit self-start p-6">
            <p className="tech-label mb-3">Support</p>
            <h3 className="font-display text-2xl font-bold uppercase">Need help?</h3>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)]">
              Check the FAQ or open a cheat product page for ESP features, aim settings, and system requirements.
            </p>
            <p className="mt-4 font-mono text-[10px] tracking-wider text-[rgb(242_240_235_/_0.3)] uppercase">
              Typical response · &lt; 24h
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-5 w-full rounded-none border-[rgb(242_240_235_/_0.15)] font-display text-xs tracking-wider uppercase"
            >
              <Link href="/#faq">View FAQ</Link>
            </Button>
          </aside>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="border-t border-[rgb(242_240_235_/_0.08)] py-20">
        <div className="container-site">
          <div className="ind-panel mx-auto max-w-2xl p-8 text-center sm:p-12">
            <p className="tech-label mb-3">Newsletter</p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              Cheat updates &amp; patch news
            </h2>
            <p className="mt-3 text-sm text-[rgb(242_240_235_/_0.45)]">
              Get notified when ESP or aimbot status changes and when new cheats launch.
            </p>
            <NewsletterForm emailPlaceholder="you@email.com" subscribeLabel="Subscribe" />
          </div>
        </div>
      </section>
    </>
  );
}
