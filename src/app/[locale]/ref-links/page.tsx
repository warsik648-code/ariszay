import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { SectionHeading } from "@/components/shared/section-heading";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Checkout Routes",
  description: "Internal checkout route map for ArisZay products.",
  robots: { index: false, follow: false },
};

const checkoutRoutes: Record<string, Record<string, string>> = {
  isle: {
    xray: "/checkout?product=isle-xray",
    pro: "/checkout?product=isle-pro",
    private: "/checkout?product=isle-private",
  },
  naraka: {
    xray: "/checkout?product=naraka-xray",
    pro: "/checkout?product=naraka-pro",
    private: "/checkout?product=naraka-private",
  },
};

export default async function RefLinksPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-site py-14">
      <SectionHeading
        title="Checkout routes"
        description="Internal checkout route map. Connect a real payment provider by updating src/config/ref-links.ts."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(checkoutRoutes).map(([game, links]) => (
          <div key={game} className="rounded-2xl border border-white/10 bg-[#0d1117] p-5 space-y-3">
            <h2 className="text-lg font-semibold capitalize text-white">{game}</h2>
            <ul className="space-y-2 text-sm">
              {Object.entries(links).map(([key, url]) => (
                <li
                  key={key}
                  className="rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <p className="text-primary font-mono text-xs">{key}</p>
                  <p className="text-white/50 mt-1 break-all font-mono text-xs">{url}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
