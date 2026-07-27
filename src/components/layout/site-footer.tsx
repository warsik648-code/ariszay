"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#070a14]">
      <div className="container-site grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Link href="/" className="text-xl font-bold">
            Aris<span className="text-primary">Zay</span>
          </Link>
          <p className="text-muted-foreground max-w-md text-sm">
            {t("description")}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg border border-white/10 px-2 py-1">
              Visa
            </span>
            <span className="rounded-lg border border-white/10 px-2 py-1">
              Mastercard
            </span>
            <span className="rounded-lg border border-white/10 px-2 py-1">
              Crypto
            </span>
            <span className="rounded-lg border border-white/10 px-2 py-1">
              PayPal
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">{t("quickLinks")}</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>
              <Link href="/games/isle" className="hover:text-foreground">
                Isle
              </Link>
            </li>
            <li>
              <Link href="/games/naraka" className="hover:text-foreground">
                Naraka
              </Link>
            </li>
            <li>
              <Link href="/products/ugc" className="hover:text-foreground">
                Products
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-foreground">
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold">{t("legal")}</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>{t("terms")}</li>
            <li>{t("privacy")}</li>
            <li>{t("refund")}</li>
          </ul>
        </div>
      </div>

      <div className="text-muted-foreground border-t border-white/10 py-6 text-center text-xs">
        © {year} {siteConfig.name}. {t("rights")}
      </div>
    </footer>
  );
}
