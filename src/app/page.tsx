import {
  Headphones,
  ShieldCheck,
  Truck,
  WalletCards,
  ArrowRight,
  Clock,
  Layers,
  Zap,
  Shield,
  Cpu,
  CloudCog,
  Paintbrush,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/shared/motion";
import { SectionHeading } from "@/components/shared/section-heading";
import { blogPosts } from "@/data/blog";
import { faqs } from "@/data/faq";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { getAllGamesWithProducts, getAllCheatProducts } from "@/data/marketplace";
import { JsonLd, organizationJsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import NewsletterForm from "@/components/shared/newsletter-form";
import { GameCollectionCard } from "@/components/marketplace/game-collection-card";
import { MarketplaceProductCard } from "@/components/marketplace/marketplace-product-card";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  palette: Paintbrush,
  cloud: CloudCog,
  cpu: Cpu,
};

export default function HomePage() {
  const gamesWithProducts = getAllGamesWithProducts();
  const allCheats = getAllCheatProducts();
  const latestPosts = blogPosts.slice(0, 3);

  const totalProducts = allCheats.length + products.length;

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Live status monitoring",
      body: "Each product page shows real-time availability. We update status within hours of any game patch.",
    },
    {
      icon: Truck,
      title: "Instant delivery",
      body: "License key and setup guide sent to your email immediately after payment confirmation.",
    },
    {
      icon: Headphones,
      title: "Support included",
      body: "Written setup guides with every purchase. Private tier customers get a dedicated support channel.",
    },
    {
      icon: WalletCards,
      title: "Secure checkout",
      body: "Payments handled by established partners supporting cards, crypto, and regional methods.",
    },
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-0 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-purple-500/8 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.8) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />
        </div>

        <div className="container-site relative">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/50 backdrop-blur">
              <Layers className="size-4 text-primary" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase">{siteConfig.name} Marketplace</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Premium Gaming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Enhancement Tools
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/55 sm:text-lg leading-relaxed">
              A focused marketplace for The Isle and Naraka: Bladepoint. Three tiers per game, real status monitoring, and instant delivery.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl px-7">
                <Link href={`/cheats/${games[0].cheatsSlug}`}>
                  Browse Cheats
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-7">
                <Link href="/products/ugc">Utility Tools</Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-3 max-w-lg mx-auto">
              {[
                { value: String(totalProducts), label: "Products" },
                { value: String(gamesWithProducts.length), label: "Supported games" },
                { value: "Instant", label: "Delivery" },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="mt-0.5 text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Game Collections ─────────────────────────────────────────── */}
      <section className="container-site py-20">
        <SectionHeading
          title="Game Collections"
          description="Browse all products organized by game. Each collection contains multiple purchasable tiers."
        />
        <StaggerChildren className="grid gap-6 lg:grid-cols-2">
          {gamesWithProducts.map((game) => (
            <StaggerItem key={game.slug}>
              <GameCollectionCard game={game} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ─── All Cheat Products ───────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeading
            title="Featured Products"
            description="Every available cheat tier across both games — compare, filter, and buy directly."
            className="mb-0"
          />
          <div className="flex flex-wrap gap-2 shrink-0">
            {gamesWithProducts.map((game) => (
              <Button key={game.slug} asChild variant="outline" size="sm" className="rounded-xl">
                <Link href={`/games/${game.slug}`}>{game.shortName} collection</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Product grid — group by game */}
        {gamesWithProducts.map((gp) => (
          <div key={gp.slug} className="mb-14 last:mb-0">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-4 w-1 rounded-full" style={{ background: gp.accent }} />
              <h3 className="text-lg font-semibold text-white">{gp.name}</h3>
              <span className="rounded-full bg-white/8 border border-white/10 px-2.5 py-0.5 text-xs text-white/40">
                {gp.productCount} products
              </span>
              <div className="ml-auto">
                <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
                  <Link href={`/games/${gp.slug}`}>
                    See full collection
                    <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      {/* ─── Utility Tools ────────────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <SectionHeading
          title="Utility Tools"
          description="Standalone tools that work alongside your game software."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const Icon = iconMap[product.icon] ?? Shield;
            const price = product.price.lifetime ?? product.price.monthly ?? 0;
            return (
              <article
                key={product.slug}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition-all hover:border-white/20"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Icon className="size-5 text-white/50" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="mt-1 text-sm text-white/50">{product.description}</p>
                </div>
                <div className="border-t border-white/8 pt-3">
                  <p className="text-xl font-bold text-white">
                    ${price.toFixed(2)}
                    <span className="text-xs font-normal text-white/40"> lifetime</span>
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {product.highlightFeatures.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-white/55">
                      <div className="size-1.5 rounded-full bg-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-auto rounded-xl border-white/10">
                  <Link href={`/products/${product.slug}`}>
                    View Details
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── How ordering works ───────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <SectionHeading title="How ordering works" description="From browsing to playing in four steps." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { num: "01", icon: Layers, title: "Choose a tier", body: "Browse The Isle or Naraka collections. Compare Xray, Pro, and Private tiers side by side." },
            { num: "02", icon: WalletCards, title: "Complete checkout", body: "Secure checkout through our payment partner. Monthly or lifetime billing available." },
            { num: "03", icon: Zap, title: "Receive your license", body: "License key and setup guide sent instantly to your email and account dashboard." },
            { num: "04", icon: ShieldCheck, title: "Install & play", body: "Follow the written guide. Support included — Private tier customers get a direct channel." },
          ].map(({ num, icon: Icon, title, body }) => (
            <div key={num} className="relative rounded-2xl border border-white/10 bg-[#0d1117] p-5">
              <span className="absolute top-4 right-4 font-mono text-3xl font-bold text-white/[0.04]">{num}</span>
              <Icon className="mb-4 size-5 text-white/40" />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/45">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Marketplace benefits ─────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <SectionHeading title="Why ArisZay" description="Built for players who care about stability and honest product information." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
              <item.icon className="size-5 text-white/40" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/45">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Blog ─────────────────────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeading title="Latest guides" className="mb-0" />
          <Button asChild variant="ghost" size="sm" className="rounded-xl shrink-0">
            <Link href="/blog">All posts<ArrowRight className="ml-1 size-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {latestPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition-all hover:border-white/20"
            >
              <div className="flex h-24 items-end overflow-hidden rounded-xl border border-white/8 bg-white/4 p-3">
                <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/60 tracking-wider uppercase">
                  {post.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold leading-snug text-white line-clamp-2">{post.title}</h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-white/45">{post.excerpt}</p>
              <p className="text-xs text-white/25 mt-auto">{post.readTimeMinutes} min · {post.publishedAt}</p>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-white/10">
                <Link href={`/blog/${post.slug}`}>Read guide</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Support + FAQ ────────────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div>
            <SectionHeading title="FAQ" className="mb-6" />
            <div className="max-w-3xl">
              <FaqAccordion items={faqs} />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6">
              <Headphones className="mb-4 size-6 text-white/40" />
              <h3 className="text-base font-semibold text-white">Need help?</h3>
              <p className="mt-2 text-sm text-white/45 leading-relaxed">
                Check the FAQ or browse product detail pages for setup information.
              </p>
              <div className="mt-4 space-y-2">
                <Clock className="size-4 text-white/25" />
                <p className="text-xs text-white/35">Typical response within 24 hours</p>
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-white/10 mt-3">
                  <Link href="/#faq">View FAQ</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────── */}
      <section className="container-site py-20 border-t border-white/8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0d1117] p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Stay ahead of patches</h2>
          <p className="mt-2 text-sm text-white/45">Get notified when products update or new tiers launch.</p>
          <NewsletterForm emailPlaceholder="Enter your email" subscribeLabel="Subscribe" />
        </div>
      </section>
    </>
  );
}
