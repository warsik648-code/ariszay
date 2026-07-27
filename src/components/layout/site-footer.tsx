"use client";

import Link from "next/link";
import { games } from "@/data/games";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[rgb(242_240_235_/_0.1)] bg-[#060606]">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="space-y-5 md:col-span-5">
          <Link href="/" className="font-display text-3xl font-extrabold tracking-tight uppercase">
            Aris<span className="text-primary">Zay</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-[rgb(242_240_235_/_0.45)]">
            Premium game cheats for The Isle and Naraka: Bladepoint — ESP, aim assist, and private
            aimbot tiers with instant delivery and live product status.
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[rgb(242_240_235_/_0.25)] uppercase">
            Game Cheats · ESP · Aimbot
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="tech-label mb-4">Cheats</p>
          <ul className="space-y-2.5 text-sm text-[rgb(242_240_235_/_0.55)]">
            {games.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/games/${game.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {game.shortName} Cheats
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products/ugc" className="hover:text-primary transition-colors">
                Utility Products
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary transition-colors">
                Cheat Guides
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="tech-label mb-4">Legal</p>
          <ul className="space-y-2.5 text-sm text-[rgb(242_240_235_/_0.55)]">
            <li>
              <Link href="/legal/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="hover:text-primary transition-colors">
                Refund
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="tech-label mb-4">Payments</p>
          <ul className="space-y-2.5 font-mono text-xs text-[rgb(242_240_235_/_0.4)]">
            <li>VISA</li>
            <li>MC</li>
            <li>CRYPTO</li>
            <li>PAYPAL</li>
          </ul>
        </div>
      </div>

      <div className="container-site flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(242_240_235_/_0.06)] py-6">
        <p className="font-mono text-[10px] tracking-wider text-[rgb(242_240_235_/_0.3)] uppercase">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <p className="font-mono text-[10px] tracking-wider text-[rgb(242_240_235_/_0.25)] uppercase">
          Status: Available
        </p>
      </div>
    </footer>
  );
}
