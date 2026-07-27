"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { blogPosts } from "@/data/blog";

export function BlogListing() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "isle" | "naraka">("all");

  const posts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesFilter =
        filter === "all" || post.game === filter || post.game === "all";
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles…"
          className="h-11 max-w-md rounded-xl border-white/10 bg-black/20"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "isle", "naraka"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className="rounded-xl capitalize"
              onClick={() => setFilter(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <GlassCard key={post.slug} className="flex h-full flex-col gap-3 overflow-hidden p-0">
            <div className="relative h-40 w-full overflow-hidden">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="from-primary/35 via-indigo/15 h-full bg-gradient-to-br to-transparent" />
              )}
              <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-1 font-mono text-[10px] tracking-wider text-white uppercase">
                {post.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5 pt-2">
              <h2 className="text-lg leading-snug font-semibold">{post.title}</h2>
              <p className="text-muted-foreground line-clamp-3 text-sm">{post.excerpt}</p>
              <p className="text-muted-foreground mt-auto text-xs">
                {post.readTimeMinutes} min read · {post.publishedAt}
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/blog/${post.slug}`}>Read article</Link>
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          No posts match your filters.
        </p>
      ) : null}
    </div>
  );
}
