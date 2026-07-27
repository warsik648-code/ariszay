"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { CartDrawer } from "@/components/cart/cart-drawer";

/** Shared desktop nav control styles — buttons and links must match exactly. */
const navItemClass =
  "tech-label inline-flex h-8 items-center justify-center border-0 bg-transparent p-0 m-0 leading-none align-middle shadow-none outline-none transition-colors hover:text-primary focus-visible:text-primary";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-all duration-300",
        scrolled && "border-[rgb(242_240_235_/_0.1)] bg-[#080808]/90 backdrop-blur-xl",
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-[1.75rem] leading-none">
            Aris<span className="text-primary">Zay</span>
          </span>
          <span className="hidden font-mono text-[9px] leading-none tracking-[0.25em] text-[rgb(242_240_235_/_0.35)] uppercase sm:inline">
            Cheats
          </span>
        </Link>

        <nav className="hidden h-16 items-center gap-8 md:flex" aria-label="Primary">
          <div className="group relative flex h-full items-center">
            <button type="button" className={navItemClass}>
              Cheats
            </button>
            <div className="invisible absolute top-full left-0 z-50 min-w-52 border border-[rgb(242_240_235_/_0.12)] bg-[#111] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              {games.map((game) => (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="block border-t border-[rgb(242_240_235_/_0.06)] px-4 py-3 font-display text-sm font-semibold tracking-wide uppercase text-[#f2f0eb]/80 hover:bg-[rgb(200_255_0_/_0.06)] hover:text-primary"
                >
                  {game.name} Cheats
                </Link>
              ))}
            </div>
          </div>
          <div className="group relative flex h-full items-center">
            <button type="button" className={navItemClass}>
              Products
            </button>
            <div className="invisible absolute top-full left-0 z-50 min-w-52 border border-[rgb(242_240_235_/_0.12)] bg-[#111] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="block border-t border-[rgb(242_240_235_/_0.06)] px-4 py-3 font-display text-sm font-semibold tracking-wide uppercase text-[#f2f0eb]/80 hover:bg-[rgb(200_255_0_/_0.06)] hover:text-primary"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/blog" className={navItemClass}>
            Blog
          </Link>
          <Link href="/#faq" className={navItemClass}>
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <CartDrawer />
          <AuthButtons />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-[rgb(242_240_235_/_0.15)] bg-transparent md:hidden"
                aria-label="Open menu"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-[rgb(242_240_235_/_0.12)] bg-[#0c0c0c]"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-xl uppercase tracking-wide">
                  ArisZay
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-1">
                <p className="tech-label mb-2">Cheats</p>
                {games.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/games/${game.slug}`}
                    onClick={() => setOpen(false)}
                    className="font-display py-2 text-lg font-semibold uppercase tracking-wide"
                  >
                    {game.name} Cheats
                  </Link>
                ))}
                <p className="tech-label mt-6 mb-2">Products</p>
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    onClick={() => setOpen(false)}
                    className="py-2 text-sm text-[rgb(242_240_235_/_0.7)]"
                  >
                    {product.name}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-1 border-t border-[rgb(242_240_235_/_0.08)] pt-4">
                  <Link
                    href="/blog"
                    onClick={() => setOpen(false)}
                    className="tech-label inline-flex h-8 items-center py-0"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/#faq"
                    onClick={() => setOpen(false)}
                    className="tech-label inline-flex h-8 items-center py-0"
                  >
                    Support
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
