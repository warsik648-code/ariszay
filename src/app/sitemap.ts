import type { MetadataRoute } from "next";
import { games } from "@/data/games";
import { cheats } from "@/data/cheats";
import { blogPosts } from "@/data/blog";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();

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

  const staticUrls = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const gameUrls = games.map((game) => ({
    url: `${base}/games/${game.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cheatUrls = cheats.flatMap((cheat) => {
    const game = games.find((g) => g.slug === cheat.game);
    if (!game) return [];
    return {
      url: `${base}/cheats/${game.cheatsSlug}/${cheat.tier}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
  });

  const blogUrls = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt).toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...gameUrls, ...cheatUrls, ...blogUrls];
}
