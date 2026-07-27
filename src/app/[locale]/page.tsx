import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  Headphones,
  ShieldCheck,
  Truck,
  WalletCards,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheatCard } from "@/components/shared/cheat-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/shared/motion";
import { GameCard } from "@/components/shared/game-card";
import { ProductCard } from "@/components/shared/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlassCard } from "@/components/shared/glass-card";
import { blogPosts } from "@/data/blog";
import { getCheatsByGame } from "@/data/cheats";
import { faqs, testimonials } from "@/data/faq";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { JsonLd, organizationJsonLd } from "@/components/shared/json-ld";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const tierCheats = getCheatsByGame("isle");
  const latestPosts = blogPosts.slice(0, 3);

  const whyItems = [
    {
      icon: ShieldCheck,
      title: tCommon("undetected"),
      body: "Actively maintained against current anti-cheat builds.",
    },
    {
      icon: Truck,
      title: tCommon("instantDelivery"),
      body: "License and download instructions arrive immediately after payment.",
    },
    {
      icon: Headphones,
      title: tCommon("support247"),
      body: "Premium support for installs, configs, and status questions.",
    },
    {
      icon: WalletCards,
      title: "Secure Payment",
      body: "Checkout through trusted payment partners with regional methods.",
    },
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/20 absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="bg-indigo/20 absolute right-10 bottom-0 h-64 w-64 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="container-site relative">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-primary mb-4 font-mono text-xs tracking-[0.25em] uppercase">
              {siteConfig.name}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-gradient">{t("headline")}</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-base sm:text-lg">
              {t("subheadline")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl px-6">
                <Link href="/games/isle">{tNav("browseCheats")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl px-6"
              >
                <Link href="/products/ugc">{tNav("viewProducts")}</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              {[
                tCommon("undetected"),
                tCommon("instantDelivery"),
                tCommon("support247"),
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-muted-foreground rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container-site py-16">
        <SectionHeading
          title={t("featuredGames")}
          description={t("featuredGamesSub")}
        />
        <StaggerChildren className="grid gap-6 md:grid-cols-2">
          {games.map((game) => (
            <StaggerItem key={game.slug}>
              <GameCard game={game} viewLabel={tCommon("viewCheats")} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <section className="container-site py-16">
        <SectionHeading title={t("tiersTitle")} description={t("tiersSub")} />
        <StaggerChildren className="grid items-stretch gap-6 md:grid-cols-3">
          {tierCheats.map((cheat) => (
            <StaggerItem key={cheat.slug} className="h-full">
              <CheatCard
                cheat={cheat}
                learnMoreLabel={tCommon("learnMore")}
                moreFeaturesLabel={tCommon("moreFeatures", {
                  count: Math.max(
                    cheat.featureCount - cheat.highlightFeatures.length,
                    0,
                  ),
                })}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <section className="container-site py-16">
        <SectionHeading
          title={t("productsTitle")}
          description={t("productsSub")}
        />
        <StaggerChildren className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product.slug} className="h-full">
              <ProductCard
                product={product}
                viewLabel={tCommon("viewProduct")}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      <section className="container-site py-16">
        <SectionHeading title={t("whyTitle")} description={t("whySub")} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((item) => (
            <GlassCard key={item.title} className="space-y-3">
              <item.icon className="text-primary size-6" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container-site py-16">
        <SectionHeading title={t("testimonialsTitle")} />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <GlassCard key={item.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary flex size-10 items-center justify-center rounded-full text-sm font-bold">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.role}</p>
                </div>
              </div>
              <div className="text-warning flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="fill-warning size-3.5" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                &ldquo;{item.quote}&rdquo;
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="container-site py-16">
        <SectionHeading title={t("blogTitle")} />
        <div className="grid gap-6 md:grid-cols-3">
          {latestPosts.map((post) => (
            <GlassCard key={post.slug} className="flex flex-col gap-3">
              <div className="from-primary/30 via-indigo/20 flex h-36 items-end rounded-2xl bg-gradient-to-br to-transparent p-4">
                <span className="rounded-full bg-black/40 px-2 py-1 font-mono text-[10px] tracking-wider uppercase">
                  {post.category}
                </span>
              </div>
              <h3 className="text-lg leading-snug font-semibold">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {post.excerpt}
              </p>
              <p className="text-muted-foreground mt-auto text-xs">
                {post.readTimeMinutes} min read · {post.publishedAt}
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/blog/${post.slug}`}>{tCommon("learnMore")}</Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="faq" className="container-site scroll-mt-24 py-16">
        <SectionHeading title={t("faqTitle")} />
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <section className="container-site py-16">
        <GlassCard className="mx-auto max-w-3xl text-center" hover={false}>
          <h2 className="text-2xl font-bold">{t("newsletterTitle")}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("newsletterSub")}
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              required
              placeholder={tCommon("emailPlaceholder")}
              className="h-11 rounded-xl border-white/10 bg-black/20"
            />
            <Button type="submit" className="h-11 rounded-xl px-6">
              {tCommon("subscribe")}
            </Button>
          </form>
        </GlassCard>
      </section>
    </>
  );
}
