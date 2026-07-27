import Link from "next/link";
import { ArrowRight, Package, LifeBuoy } from "lucide-react";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { ticketStatusLabel } from "@/lib/support/labels";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AccountOverviewPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const [orders, tickets] = await Promise.all([
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true, refundRequests: { select: { status: true }, take: 1, orderBy: { createdAt: "desc" } } },
    }),
    db.ticket.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="ind-panel p-6">
        <p className="tech-label mb-2">Status</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-[#f2f0eb]">
          Operations overview
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[rgb(242_240_235_/_0.45)]">
          Track orders, open support tickets, and follow refund requests from Mission Control.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-none">
            <Link href="/account/orders">
              My Orders <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none border-white/15">
            <Link href="/account/tickets/new">New ticket</Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#f2f0eb]">
            Recent orders
          </h3>
          <Link href="/account/orders" className="tech-label text-primary hover:underline">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <Empty icon={Package} text="No orders yet." href="/cheats/the-isle" cta="Browse cheats" />
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber ?? order.id}`}
                className="ind-panel-hover flex flex-wrap items-center justify-between gap-3 border border-[rgb(242_240_235_/_0.1)] bg-[#111] px-4 py-3"
              >
                <div>
                  <p className="font-mono text-sm text-primary">
                    {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-white/45">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                </div>
                <div className="text-right text-xs text-white/50">
                  <p>${Number(order.totalAmount).toFixed(2)}</p>
                  <p>{formatMadridDateShort(order.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-[#f2f0eb]">
            Recent tickets
          </h3>
          <Link href="/account/tickets" className="tech-label text-primary hover:underline">
            View all
          </Link>
        </div>
        {tickets.length === 0 ? (
          <Empty icon={LifeBuoy} text="No tickets yet." href="/account/tickets/new" cta="Open ticket" />
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/account/tickets/${t.ticketNumber}`}
                className="ind-panel-hover flex flex-wrap items-center justify-between gap-3 border border-[rgb(242_240_235_/_0.1)] bg-[#111] px-4 py-3"
              >
                <div>
                  <p className="font-mono text-sm text-primary">{t.ticketNumber}</p>
                  <p className="text-xs text-white/45">{t.subject}</p>
                </div>
                <p className="text-xs text-white/50">{ticketStatusLabel[t.status]}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Empty({
  icon: Icon,
  text,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border border-[rgb(242_240_235_/_0.1)] bg-[#111] px-6 py-10 text-center">
      <Icon className="mx-auto mb-3 size-8 text-white/20" />
      <p className="text-sm text-white/50">{text}</p>
      <Button asChild variant="outline" className="mt-4 rounded-none border-white/15">
        <Link href={href}>
          {cta} <ArrowRight className="ml-1.5 size-4" />
        </Link>
      </Button>
    </div>
  );
}
