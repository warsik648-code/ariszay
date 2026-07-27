import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shield, Zap, Headphones, Check } from "lucide-react";
import Link from "next/link";

import { FeatureComparisonTable } from "@/components/shared/feature-comparison-table";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { CheatCard } from "@/components/shared/cheat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/components/shared/json-ld";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/shared/buy-button";
import { getCheatByGameAndTier, getCheatsByGame, getFeaturesForCheat } from "@/data/cheats";
import { games, getGameByCheatsSlug } from "@/data/games";
import { gameFaqs } from "@/data/faq";
import type { CheatTier } from "@/types";

type PageProps = { params: Promise<{ gameSlug: string; tier: string }> };

const validTiers: CheatTier[] = ["xray", "pro", "private"];
const tierLabels: Record<CheatTier, string> = { xray: "CORE ESP", pro: "AIM ASSIST", private: "FULL AIMBOT" };

export function generateStaticParams() {
  return games.flatMap((game) => validTiers.map((tier) => ({ gameSlug: game.cheatsSlug, tier })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameSlug, tier } = await params;
  const game = getGameByCheatsSlug(gameSlug);
  if (!game || !validTiers.includes(tier as CheatTier)) return {};
  const cheat = getCheatByGameAndTier(game.slug, tier as CheatTier);
  if (!cheat) return {};
  const tierSeo: Record<CheatTier, string> = {
    xray: "ESP Hack",
    pro: "Aim Assist Cheat",
    private: "Private Aimbot",
  };
  const seoLabel = tierSeo[tier as CheatTier];
  return {
    title: `${cheat.name} — ${game.name} ${seoLabel}`,
    description: cheat.description,
    alternates: { canonical: `/cheats/${game.cheatsSlug}/${tier}` },
    openGraph: { title: `${cheat.name} | ${game.name} ${seoLabel}`, description: cheat.description },
  };
}

export default async function CheatDetailPage({ params }: PageProps) {
  const { gameSlug, tier } = await params;
  const game = getGameByCheatsSlug(gameSlug);
  if (!game) notFound();
  if (!validTiers.includes(tier as CheatTier)) notFound();

  const cheat = getCheatByGameAndTier(game.slug, tier as CheatTier);
  if (!cheat) notFound();

  const features = getFeaturesForCheat(cheat);
  const productSlug = `${cheat.game}-${cheat.tier}`;
  const checkoutUrl = `/checkout?product=${productSlug}`;
  const price = cheat.price.monthly ?? cheat.price.lifetime ?? 0;
  const faqItems = gameFaqs.filter((f) => f.game === game.slug);
  const relatedCheats = getCheatsByGame(game.slug).filter((c) => c.tier !== cheat.tier);

  const infoCards = [
    { icon: Shield, title: "Detection Status", body: "Fully external, no kernel injection. Undetected against EAC as of 2026. Updated within hours of every patch." },
    { icon: Zap, title: "Delivery", body: "Instant digital access — license key sent to your account after payment. No waiting." },
    { icon: Headphones, title: "Support", body: "Priority support included. Setup help, patch updates, and config guides available." },
  ];

  const howToSteps = [
    { num: "1", title: "Choose Your Plan", body: "Visit our store, select Monthly or Lifetime, and complete secure checkout." },
    { num: "2", title: "Receive Your Key", body: "License key delivered instantly to your account after payment." },
    { num: "3", title: "Download the Loader", body: "Download our lightweight loader from the dashboard — no installation needed." },
    { num: "4", title: "Launch & Play", body: `Start ${game.name}, run the loader, and enjoy full cheat features.` },
  ];

  const sysReq = cheat.systemRequirements;
  const gameplaySrc =
    cheat.game === "isle" && cheat.tier === "xray"
      ? "/videos/isle-xray-gameplay.mp4"
      : null;

  return (
    <div className="container-site py-10 pb-28 md:pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${game.name} Cheats`, path: `/cheats/${game.cheatsSlug}` }, { name: cheat.name, path: `/cheats/${game.cheatsSlug}/${cheat.tier}` }])} />
      <JsonLd data={productJsonLd({ name: cheat.name, description: cheat.description, path: `/cheats/${game.cheatsSlug}/${cheat.tier}`, price })} />

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/40">
          <li><Link href="/" className="hover:text-white/70 transition-colors">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/cheats/${game.cheatsSlug}`} className="hover:text-white/70 transition-colors">{game.name} Cheats</Link></li>
          <li aria-hidden>/</li>
          <li className="text-white/70">{cheat.name}</li>
        </ol>
      </nav>

      <section className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/40">{tierLabels[cheat.tier as CheatTier]}</span>
          <StatusBadge status={cheat.status} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">{cheat.name}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-white/60 mb-6">{cheat.description}</p>
        <div className="flex flex-wrap gap-3">
          <BuyButton
            href={checkoutUrl}
            productSlug={productSlug}
            plan={cheat.price.monthly != null ? "monthly" : "lifetime"}
            label={`Buy ${cheat.name}`}
            size="lg"
          />
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href={`/cheats/${game.cheatsSlug}`}>View All {game.shortName} Cheats</Link>
          </Button>
        </div>
      </section>

      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {infoCards.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
            <Icon className="mb-3 size-5 text-white/50" />
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs leading-relaxed text-white/50">{body}</p>
          </div>
        ))}
      </section>

      <section className="mb-12 overflow-hidden rounded-2xl border border-white/10">
        {gameplaySrc ? (
          <>
            <div className="relative bg-black">
              <video
                className="aspect-video w-full bg-black object-contain"
                controls
                playsInline
                preload="metadata"
                aria-label={`${cheat.name} gameplay preview`}
              >
                <source src={gameplaySrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0d1117] px-4 py-3">
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                Gameplay
              </p>
              <p className="text-xs text-white/50">{cheat.name} ESP in-game</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex aspect-video items-center justify-center bg-[#0d1117]">
              <div className="text-center">
                <p className="font-mono text-xs tracking-[0.2em] text-white/30 uppercase">Preview</p>
                <p className="mt-2 text-lg font-semibold text-white/60">{cheat.name}</p>
                <p className="mt-1 text-sm text-white/30">Screenshots — add via admin panel</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto bg-black/20 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 w-24 shrink-0 rounded-xl border border-white/10 bg-white/5" aria-hidden />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Buy {cheat.name}</h2>
        <p className="text-white/50 mb-6 text-sm">Monthly &amp; Lifetime options available · Instant delivery after purchase.</p>
        <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
          {cheat.price.monthly != null && (
            <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
              <p className="text-sm text-white/50">Monthly subscription</p>
              <p className="text-3xl font-bold text-white">${cheat.price.monthly.toFixed(2)}<span className="ml-1 text-sm font-normal text-white/40">/mo</span></p>
              <p className="text-xs text-white/40">Cancel anytime</p>
              <BuyButton
                productSlug={productSlug}
                plan="monthly"
                label="Select monthly"
                className="w-full"
              />
            </div>
          )}
          {cheat.price.lifetime != null && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
              <p className="text-sm text-white/50">Lifetime access</p>
              <p className="text-3xl font-bold text-white">${cheat.price.lifetime.toFixed(2)}<span className="ml-1 text-sm font-normal text-white/40"> one-time</span></p>
              <p className="text-xs text-white/40">Pay once, access forever</p>
              <BuyButton
                productSlug={productSlug}
                plan="lifetime"
                label="Select lifetime"
                className="w-full"
              />
            </div>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to buy this cheat</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howToSteps.map((step) => (
            <div key={step.num} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/8 font-mono text-xs text-white/60 mb-3">{step.num}</span>
              <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <BuyButton productSlug={productSlug} plan={cheat.price.monthly != null ? "monthly" : "lifetime"} label="Buy this cheat" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What&apos;s Included <span className="ml-2 font-mono text-sm font-normal text-white/40">({features.length} features)</span></h2>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 mb-2.5 break-inside-avoid">
              <Check className="size-4 shrink-0 text-emerald-400" />
              <span className="text-sm text-white/70">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">System Requirements</h2>
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 max-w-lg">
          <ul className="space-y-2.5">
            {[sysReq.os, `${game.name} via Steam`, sysReq.cpu, sysReq.ram, sysReq.gpu, sysReq.compatible, "No virtual machines"].map((req) => (
              <li key={req} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="size-4 shrink-0 text-emerald-400" />{req}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <SectionHeading title="Compare All Tiers" description="See exactly what each tier includes." />
        <FeatureComparisonTable gameSlug={game.slug} activeColumn={cheat.tier} />
        <div className="mt-6">
          <BuyButton productSlug={productSlug} plan={cheat.price.monthly != null ? "monthly" : "lifetime"} label="Buy this cheat" />
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-white">{game.shortName} FAQ</h2>
          <div className="max-w-3xl"><FaqAccordion items={faqItems} /></div>
        </section>
      )}

      {relatedCheats.length > 0 && (
        <section className="mb-12">
          <SectionHeading title="Other Cheat Tiers" description={`More options for ${game.name}`} />
          <div className="grid gap-6 md:grid-cols-2">
            {relatedCheats.map((related) => <CheatCard key={related.slug} cheat={related} />)}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0e1a]/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">
            {cheat.price.monthly != null ? `$${cheat.price.monthly.toFixed(2)}/mo` : `$${cheat.price.lifetime?.toFixed(2)}`}
          </p>
          <BuyButton
            productSlug={productSlug}
            plan={cheat.price.monthly != null ? "monthly" : "lifetime"}
            label={`Buy ${tierLabels[cheat.tier as CheatTier]}`}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
