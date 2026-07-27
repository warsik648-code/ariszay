import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Account",
  description: "ArisZay account dashboard for licenses and orders.",
};

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-site py-14">
      <SectionHeading
        title="Account"
        description="Dashboard shell — connect auth later. Licenses and orders shown as placeholders."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="space-y-2" hover={false}>
          <p className="text-muted-foreground text-sm">Signed in as</p>
          <p className="text-lg font-semibold">player@ariszay.com</p>
          <Badge variant="outline" className="rounded-full">
            Demo user
          </Badge>
        </GlassCard>

        <GlassCard className="space-y-3 lg:col-span-2" hover={false}>
          <h2 className="font-semibold">Active licenses</h2>
          {[
            { name: "Isle Private", status: "Active", expires: "2026-08-27" },
            { name: "HWID Spoofer", status: "Lifetime", expires: "—" },
          ].map((license) => (
            <div
              key={license.name}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{license.name}</p>
                <p className="text-muted-foreground">
                  Expires: {license.expires}
                </p>
              </div>
              <Badge className="rounded-full">{license.status}</Badge>
            </div>
          ))}
        </GlassCard>

        <GlassCard className="space-y-3 lg:col-span-3" hover={false}>
          <h2 className="font-semibold">Recent orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-white/10">
                  <td className="py-3 font-mono text-xs">#AZ-10482</td>
                  <td>Isle Private Monthly</td>
                  <td>$29.99</td>
                  <td>Paid</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td className="py-3 font-mono text-xs">#AZ-10311</td>
                  <td>HWID Spoofer Lifetime</td>
                  <td>$34.99</td>
                  <td>Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/checkout">Go to checkout</Link>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
