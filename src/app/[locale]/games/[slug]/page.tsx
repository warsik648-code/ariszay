import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { CheatCard } from "@/components/shared/cheat-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCheatsByGame } from "@/data/cheats";
import { gameFaqs } from "@/data/faq";
import { getGame, games } from "@/data/games";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  return {
    title: `${game.name} Cheats & Hacks 2026`,
    description: game.description,
  };
}

export default async function GamePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getGame(slug);
  if (!game) notFound();

  const cheats = getCheatsByGame(game.slug);
  const faqs = gameFaqs.filter((item) => item.game === game.slug);

  return (
    <div className="pb-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: game.name, path: `/games/${game.slug}` },
        ])}
      />

      <section
        className="border-b border-white/10 py-16"
        style={{
          background: `radial-gradient(circle at top, ${game.accent}33, transparent 55%)`,
        }}
      >
        <div className="container-site max-w-3xl">
          <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            Game
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{game.name}</h1>
          <p className="text-muted-foreground mt-4">{game.description}</p>
        </div>
      </section>

      <section className="container-site py-16">
        <SectionHeading
          title="Available cheats"
          description="Compare Xray, Pro, and Private side by side."
        />
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {cheats.map((cheat) => (
            <CheatCard key={cheat.slug} cheat={cheat} />
          ))}
        </div>
      </section>

      <section className="container-site py-8">
        <SectionHeading title={`${game.shortName} FAQ`} />
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </div>
  );
}
