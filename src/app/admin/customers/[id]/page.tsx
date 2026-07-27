import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireStaffPortal } from "@/lib/permissions";
import { formatMadridDateShort } from "@/lib/support/datetime";
import { ticketStatusLabel } from "@/lib/support/labels";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  await requireStaffPortal();
  const { id } = await params;

  const customer = await db.user.findFirst({
    where: { id, role: "CUSTOMER" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: { take: 3 } },
      },
      tickets: {
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
    },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/customers" className="text-sm text-white/40 hover:text-white/70">
        ← Customers
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-white">{customer.email}</h1>
        <p className="text-sm text-white/40">{customer.name ?? "—"} · Joined {formatMadridDateShort(customer.createdAt)}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Orders</h2>
        <div className="space-y-2">
          {customer.orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="block rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 hover:bg-white/[0.02]"
            >
              <span className="font-mono text-primary">{o.orderNumber ?? o.id.slice(-8)}</span>
              <span className="ml-3 text-xs text-white/40">${Number(o.totalAmount).toFixed(2)} · {o.status}</span>
              <p className="text-xs text-white/50">{o.items.map((i) => i.productName).join(", ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">Tickets</h2>
        <div className="space-y-2">
          {customer.tickets.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tickets/${t.ticketNumber}`}
              className="block rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 hover:bg-white/[0.02]"
            >
              <span className="font-mono text-primary">{t.ticketNumber}</span>
              <span className="ml-3 text-xs text-white/40">{ticketStatusLabel[t.status]}</span>
              <p className="text-xs text-white/50">{t.subject}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
