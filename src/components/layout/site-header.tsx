"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { CartDrawer } from "@/components/cart/cart-drawer";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = (next: AppLocale) => {
    router.replace(pathname, { locale: next });
  };

  const navLinkClass =
    "text-sm font-medium text-muted-foreground transition hover:text-foreground";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-all duration-300",
        scrolled &&
          "border-white/10 bg-[#0a0e1a]/80 shadow-lg shadow-black/20 backdrop-blur-xl",
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Aris<span className="text-primary">Zay</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(navLinkClass, "inline-flex items-center gap-1")}
            >
              {t("cheats")}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              {games.map((game) => (
                <DropdownMenuItem key={game.slug} asChild>
                  <Link href={`/cheats/${game.cheatsSlug}`}>{game.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(navLinkClass, "inline-flex items-center gap-1")}
            >
              {t("products")}
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {products.map((product) => (
                <DropdownMenuItem key={product.slug} asChild>
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/blog" className={navLinkClass}>
            {t("blog")}
          </Link>
          <Link href="/#faq" className={navLinkClass}>
            {t("help")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-xl">
                {locale === "zh" ? "CN" : "EN"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchLocale("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLocale("zh")}>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CartDrawer />
          <AuthButtons />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-white/10 bg-[#0a0e1a]"
            >
              <SheetHeader>
                <SheetTitle>ArisZay</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  {t("cheats")}
                </p>
                {games.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/cheats/${game.cheatsSlug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm"
                  >
                    {game.name}
                  </Link>
                ))}
                <p className="text-muted-foreground mt-2 font-mono text-xs tracking-widest uppercase">
                  {t("products")}
                </p>
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-sm"
                  >
                    {product.name}
                  </Link>
                ))}
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="text-sm"
                >
                  {t("blog")}
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setOpen(false)}
                  className="text-sm"
                >
                  {t("help")}
                </Link>
                <p className="text-muted-foreground mt-4 text-xs">
                  {tCommon("language")}: {locale === "zh" ? "中文" : "English"}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
