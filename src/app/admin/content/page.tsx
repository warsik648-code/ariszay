import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminContentPage() {
  const [blogCount, faqCount] = await Promise.all([
    db.blogPost.count(),
    db.faq.count(),
  ]);

  const sections = [
    {
      label: "Blog posts",
      count: blogCount,
      href: "/admin/content/blog",
      description: "Create and manage articles and guides",
    },
    {
      label: "FAQs",
      count: faqCount,
      href: "/admin/content/faq",
      description: "Manage frequently asked questions",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Content</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ label, count, href, description }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition-colors hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-white">{label}</h2>
              <span className="text-2xl font-bold text-white/30">{count}</span>
            </div>
            <p className="mt-1 text-sm text-white/40">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
