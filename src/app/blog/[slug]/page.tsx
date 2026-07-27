import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/components/shared/json-ld";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }] }
      : undefined,
  };
}

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderContent(content: string) {
  return content.split("\n").map((line, index) => {
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      return (
        <figure key={index} className="my-8 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={src!}
            alt={alt || "Blog image"}
            width={1280}
            height={720}
            className="h-auto w-full object-cover"
          />
          {alt ? (
            <figcaption className="border-t border-white/10 bg-black/30 px-4 py-2 font-mono text-[10px] tracking-wider text-white/40 uppercase">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    if (line.startsWith("## "))
      return (
        <h2
          key={index}
          id={line.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="mt-10 scroll-mt-28 text-2xl font-bold text-white"
        >
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={index} className="mt-6 text-lg font-semibold text-white">
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("✔ "))
      return (
        <p key={index} className="text-muted-foreground my-2 leading-relaxed">
          <span className="mr-2 text-primary">✔</span>
          {formatInline(line.slice(2))}
        </p>
      );
    if (line.startsWith("- "))
      return (
        <li key={index} className="text-muted-foreground ml-5 list-disc leading-relaxed">
          {formatInline(line.slice(2))}
        </li>
      );
    if (/^\d+\.\s/.test(line))
      return (
        <li key={index} className="text-muted-foreground ml-5 list-decimal leading-relaxed">
          {formatInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    if (!line.trim()) return <div key={index} className="h-3" />;
    return (
      <p key={index} className="text-muted-foreground leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);
  const headings = post.content
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3));

  return (
    <div className="container-site py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          datePublished: post.publishedAt,
          author: post.author,
        })}
      />

      <div className="mb-8 overflow-hidden rounded-3xl border border-white/10">
        {post.coverImage ? (
          <div className="relative min-h-56">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 960px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/70 to-transparent" />
            <div className="relative flex min-h-56 items-end p-8">
              <div>
                <p className="text-primary font-mono text-xs tracking-widest uppercase">
                  {post.category}
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
                  {post.title}
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  {post.author} · {post.publishedAt} · {post.readTimeMinutes} min read
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="from-primary/40 to-indigo/30 flex min-h-56 items-end bg-gradient-to-br via-[#1a1f2e] p-8">
            <div>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {post.category}
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-4xl">{post.title}</h1>
              <p className="text-muted-foreground mt-3 text-sm">
                {post.author} · {post.publishedAt} · {post.readTimeMinutes} min read
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="text-sm font-semibold">On this page</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {headings.map((h) => (
                <li key={h}>
                  <a
                    href={`#${h.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="hover:text-foreground"
                  >
                    {h}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-4 w-full rounded-xl">
              <Link href="/cheats/the-isle">Browse Isle cheats</Link>
            </Button>
          </div>
        </aside>
        <article className="min-w-0">
          <p className="text-muted-foreground mb-6 text-base leading-relaxed">{post.excerpt}</p>
          <div className="space-y-1">{renderContent(post.content)}</div>
          <GlassCard className="mt-12 space-y-3" hover={false}>
            <p className="font-medium">Ready to play smarter?</p>
            <Button asChild className="rounded-xl">
              <Link href="/cheats/the-isle">View The Isle products</Link>
            </Button>
          </GlassCard>
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Related posts</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <GlassCard key={item.slug} className="space-y-2">
                  <h3 className="leading-snug font-semibold">{item.title}</h3>
                  <Button asChild variant="outline" size="sm" className="rounded-xl">
                    <Link href={`/blog/${item.slug}`}>Read</Link>
                  </Button>
                </GlassCard>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
