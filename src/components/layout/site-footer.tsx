"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { games } from "@/data/games";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#070a14]">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Aris<span className="text-primary">Zay</span>
          </Link>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            {t("description")}
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
          <h3 className="mb-4 text-sm font-semibold">{t("quickLinks")}</h3>
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
          <h3 className="mb-4 text-sm font-semibold">{t("legal")}</h3>
          <ul className="text-muted-foreground space-y-2.5 text-sm">
            <li>
              <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="hover:text-foreground transition-colors">
                {t("refund")}
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-foreground transition-colors">
                My Account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-muted-foreground border-t border-white/10 py-6 text-center text-xs">
        © {year} {siteConfig.name}. {t("rights")}
      </div>
    </footer>
  );
}
