import { redirect } from "next/navigation";
import Link from "next/link";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { NewTicketForm } from "@/components/account/new-ticket-form";

type PageProps = { searchParams: Promise<{ orderId?: string }> };

export default async function NewTicketPage({ searchParams }: PageProps) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  const { orderId } = await searchParams;
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, items: { select: { productName: true }, take: 2 } },
  });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href="/account/tickets" className="tech-label text-white/40 hover:text-primary">
          ← Tickets
        </Link>
        <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-[#f2f0eb]">
          New ticket
        </h2>
      </div>
      <NewTicketForm
        orders={orders.map((o) => ({
          id: o.id,
          label: `${o.orderNumber ?? o.id.slice(-8)} — ${o.items.map((i) => i.productName).join(", ")}`,
        }))}
        defaultOrderId={orderId}
      />
    </div>
  );
}
