import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from "@/components/shared/json-ld";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blog";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function renderContent(content: string) {
  return content.split("\n").map((line, index) => {
    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          id={line
            .slice(3)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}
          className="mt-10 scroll-mt-28 text-2xl font-bold"
        >
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="text-muted-foreground ml-5 list-disc">
          {line.slice(2)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={index} className="text-muted-foreground ml-5 list-decimal">
          {line.replace(/^\d+\.\s/, "")}
        </li>
      );
    }
    if (!line.trim()) return <div key={index} className="h-3" />;
    return (
      <p key={index} className="text-muted-foreground leading-relaxed">
        {line}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug);
  const headings = post.content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3));

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
        <div className="from-primary/40 to-indigo/30 flex min-h-56 items-end bg-gradient-to-br via-[#1a1f2e] p-8">
          <div>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {post.category}
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              {post.author} · {post.publishedAt} · {post.readTimeMinutes} min
              read
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="text-sm font-semibold">On this page</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {headings.map((heading) => (
                <li key={heading}>
                  <a
                    href={`#${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="hover:text-foreground"
                  >
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="min-w-0">
          <div className="space-y-1">{renderContent(post.content)}</div>

          <GlassCard className="mt-12 space-y-3" hover={false}>
            <p className="font-medium">Was this helpful?</p>
            <div className="flex gap-2">
              <Button className="rounded-xl" type="button">
                Yes
              </Button>
              <Button variant="outline" className="rounded-xl" type="button">
                No
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Share: copy the URL from your browser address bar.
            </p>
          </GlassCard>

          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Related posts</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <GlassCard key={item.slug} className="space-y-2">
                  <h3 className="leading-snug font-semibold">{item.title}</h3>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
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
