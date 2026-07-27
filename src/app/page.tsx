import {
  Headphones,
  ShieldCheck,
  Truck,
  WalletCards,
  ArrowRight,
  Clock,
  Package,
  Download,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CheatCard } from "@/components/shared/cheat-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/shared/motion";
import { GameCard } from "@/components/shared/game-card";
import { ProductCard } from "@/components/shared/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { blogPosts } from "@/data/blog";
import { getCheatsByGame } from "@/data/cheats";
import { faqs } from "@/data/faq";
import { games } from "@/data/games";
import { products } from "@/data/products";
import { JsonLd, organizationJsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import NewsletterForm from "@/components/shared/newsletter-form";

export default function HomePage() {
  const isleCheats = getCheatsByGame("isle");
  const latestPosts = blogPosts.slice(0, 3);

  const whyItems = [
    {
      icon: ShieldCheck,
      title: "Status monitoring",
      body: "Each product page shows a live availability status. We update it whenever the product state changes.",
    },
    {
      icon: Truck,
      title: "Instant delivery",
      body: "License and setup instructions are sent to your email immediately after payment confirmation.",
    },
    {
      icon: Headphones,
      title: "Support included",
      body: "Written guides are included with every purchase. Private tier customers get a direct support channel.",
    },
    {
      icon: WalletCards,
      title: "Secure checkout",
      body: "Checkout is handled by established payment partners supporting cards and regional methods.",
    },
  ];

  const howItWorks = [
    {
      icon: CheckCircle,
      step: "1",
      title: "Choose your game & tier",
      body: "Browse The Isle or Naraka cheats. Pick the Xray, Pro, or Private tier that fits your needs.",
    },
    {
      icon: WalletCards,
      step: "2",
      title: "Complete payment",
      body: "Checkout securely through our payment partner. Monthly or lifetime options available.",
    },
    {
      icon: Download,
      step: "3",
      title: "Receive your license",
      body: "Your license key and setup guide arrive by email and appear in your account dashboard.",
    },
    {
      icon: Package,
      step: "4",
      title: "Install and play",
      body: "Follow the written guide to install. Support is available if you run into any issues.",
    },
  ];

  return (
    <>
      <JsonLd data={organizationJsonLd()} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.5) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />
        </div>
        <div className="container-site relative">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-primary mb-4 font-mono text-xs tracking-[0.25em] uppercase">
              {siteConfig.name}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Premium Gaming Enhancement Software
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/60 sm:text-lg">
              Enhancement software for The Isle and Naraka: Bladepoint. Clear product status, instant delivery, setup guides included.
            </p>
            <p className="mt-3 text-sm text-white/40">
              Check each product page for current availability status before purchasing.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl px-6">
                <Link href={`/cheats/${games[0].cheatsSlug}`}>
                  Browse Cheats
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
                <Link href="/products/ugc">View Products</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
              {["Status monitored", "Instant Delivery", "24/7 Support"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-white/50 backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured games */}
      <section className="container-site py-16">
        <SectionHeading title="Featured Games" description="Start with our flagship titles." />
        <StaggerChildren className="grid gap-6 md:grid-cols-2">
          {games.map((game) => (
            <StaggerItem key={game.slug}>
              <GameCard game={game} viewLabel="View Cheats" />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Tier preview */}
      <section className="container-site py-16">
        <SectionHeading title="Cheat Tiers" description="Pick the power level that matches your playstyle." />
        <StaggerChildren className="grid items-stretch gap-6 md:grid-cols-3">
          {isleCheats.map((cheat, index) => (
            <StaggerItem key={cheat.slug} className="h-full">
              <CheatCard cheat={cheat} learnMoreLabel="Learn More" featured={index === 1} />
            </StaggerItem>
          ))}
        </StaggerChildren>
        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/cheats/${games[1].cheatsSlug}`}>
              View Naraka cheats
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Products */}
      <section className="container-site py-16">
        <SectionHeading title="Products" description="Utility tools that pair with every loadout." />
        <StaggerChildren className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product.slug} className="h-full">
              <ProductCard product={product} viewLabel="View Product" />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* How it works */}
      <section className="container-site py-16">
        <SectionHeading
          title="How ordering works"
          description="From choosing a product to having it installed — four straightforward steps."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full border border-white/10 font-mono text-xs text-white/50">
                  {step}
                </span>
                <Icon className="size-4 text-white/40" />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-site py-16">
        <SectionHeading title="Why Choose ArisZay" description="Built for players who care about stability and support." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
              <item.icon className="size-5 text-white/50" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="container-site py-16">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title="Recent Blog Posts" className="mb-0" />
          <Button asChild variant="ghost" size="sm" className="rounded-xl shrink-0 mb-8">
            <Link href="/blog">
              All posts
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latestPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition-all duration-200 hover:border-white/20"
            >
              <div className="flex h-28 items-end overflow-hidden rounded-xl border border-white/8 bg-white/4 p-3">
                <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/60 tracking-wider uppercase">
                  {post.category}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-white line-clamp-2">{post.title}</h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-white/50">{post.excerpt}</p>
              <p className="text-xs text-white/30 mt-auto">{post.readTimeMinutes} min read · {post.publishedAt}</p>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href={`/blog/${post.slug}`}>Read post</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="container-site py-16">
        <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <Headphones className="size-6 text-white/50" />
              <h2 className="text-2xl font-bold text-white">Need help?</h2>
              <p className="max-w-md leading-relaxed text-white/60">
                Check the FAQ below for common questions. Private tier customers have access to a direct support channel.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end md:justify-center">
              <Clock className="size-4 text-white/30" />
              <p className="text-sm text-white/40">Typical response within 24 hours</p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/#faq">View FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-site scroll-mt-24 py-16">
        <SectionHeading title="FAQ" />
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-site py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0d1117] p-6 text-center md:p-10">
          <h2 className="text-2xl font-bold text-white">Stay ahead of patches</h2>
          <p className="mt-2 text-sm text-white/50">Get updates on new cheats and features.</p>
          <NewsletterForm emailPlaceholder="Enter your email" subscribeLabel="Subscribe" />
        </div>
      </section>
    </>
  );
}
