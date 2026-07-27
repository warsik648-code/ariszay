import { SectionHeading } from "@/components/shared/section-heading";

const pages: { slug: string; title: string; content: string }[] = [
  { slug: "terms", title: "Terms of Service", content: "This page is a placeholder. Replace this with your actual Terms of Service before launching." },
  { slug: "privacy", title: "Privacy Policy", content: "This page is a placeholder. Replace this with your actual Privacy Policy before launching." },
  { slug: "refund", title: "Refund Policy", content: "This page is a placeholder. Replace this with your actual Refund Policy before launching." },
];

export function generateStaticParams() {
  return pages.map((p) => ({ page: p.slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const entry = pages.find((p) => p.slug === page);
  if (!entry) return null;

  return (
    <div className="container-site py-16">
      <div className="mx-auto max-w-2xl">
        <SectionHeading title={entry.title} align="left" />
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/8 p-5">
          <p className="text-sm font-medium text-yellow-400">Placeholder content</p>
          <p className="mt-1.5 text-sm text-white/60">{entry.content}</p>
        </div>
      </div>
    </div>
  );
}
