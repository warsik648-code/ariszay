import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { referralLinks } from "@/config/ref-links";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Referral Links",
  description: "Configured payment referral URLs for ArisZay products.",
  robots: { index: false, follow: false },
};

export default async function RefLinksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-site py-14">
      <SectionHeading
        title="Referral links"
        description="Update these URLs in src/config/ref-links.ts. This page is for operators and is noindex."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(referralLinks).map(([game, links]) => (
          <GlassCard key={game} hover={false} className="space-y-3">
            <h2 className="text-lg font-semibold capitalize">{game}</h2>
            <ul className="space-y-2 text-sm">
              {Object.entries(links).map(([key, url]) => (
                <li
                  key={key}
                  className="rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <p className="text-primary font-mono text-xs">{key}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground mt-1 break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
