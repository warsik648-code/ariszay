"use client";

import Link from "next/link";
import { games } from "@/data/games";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#070a14]">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Aris<span className="text-primary">Zay</span>
          </Link>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Enhancement software for The Isle and Naraka: Bladepoint. Clear product status, instant delivery, and written setup guides included.
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
            {["Visa", "Mastercard", "Crypto", "PayPal"].map((method) => (
              <span
                key={method}
                className="rounded-lg border border-white/10 px-2.5 py-1"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
          <ul className="text-muted-foreground space-y-2.5 text-sm">
            {games.map((game) => (
              <li key={game.slug}>
                <Link
                  href={`/cheats/${game.cheatsSlug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {game.shortName} Cheats
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products/ugc" className="hover:text-foreground transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">Legal</h3>
          <ul className="text-muted-foreground space-y-2.5 text-sm">
            <li>
              <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="hover:text-foreground transition-colors">
                Refund
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-site border-t border-white/8 py-6">
        <p className="text-muted-foreground text-xs">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
