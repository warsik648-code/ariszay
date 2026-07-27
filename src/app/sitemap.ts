import type { MetadataRoute } from "next";
import { games } from "@/data/games";
import { cheats } from "@/data/cheats";
import { blogPosts } from "@/data/blog";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();

  const locales = ["en"];
  const staticRoutes = [
    "",
    "/blog",
    "/#faq",
    "/cheats/the-isle",
    "/cheats/naraka-bladepoint",
    "/products/ugc",
    "/products/skin-changer",
    "/products/cloud-dma",
    "/products/hwid-spoofer",
  ];

  const staticUrls = locales.flatMap((locale) =>
    staticRoutes.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const gameUrls = games.flatMap((game) =>
    locales.map((locale) => ({
      url: `${base}/${locale}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const cheatUrls = cheats.flatMap((cheat) => {
    const game = games.find((g) => g.slug === cheat.game);
    if (!game) return [];
    return locales.map((locale) => ({
      url: `${base}/${locale}/cheats/${game.cheatsSlug}/${cheat.tier}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  });

  const blogUrls = blogPosts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${base}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt).toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticUrls, ...gameUrls, ...cheatUrls, ...blogUrls];
}
