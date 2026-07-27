import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Package, User, ArrowRight, Shield } from "lucide-react";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import SignOutButton from "@/components/auth/sign-out-button";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  }).catch(() => []);

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    PAID: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    DELIVERED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    REFUNDED: "text-white/50 bg-white/5 border-white/10",
    CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="container-site py-12 pb-20">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Account</h1>
          <p className="mt-1 text-white/50">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2">
          {[
            { icon: Package, label: "Orders", href: "/account", active: true },
            { icon: User, label: "Profile", href: "/account/profile", active: false },
            { icon: Shield, label: "Security", href: "/account/security", active: false },
          ].map(({ icon: Icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main>
          <h2 className="mb-5 text-lg font-semibold text-white">Order history</h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-10 text-center">
              <Package className="mx-auto mb-3 size-8 text-white/20" />
              <p className="text-white/50">No orders yet.</p>
              <Button asChild variant="outline" className="mt-4 rounded-xl">
                <Link href="/cheats/the-isle">
                  Browse cheats
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-[#0d1117] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {order.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[order.status] ?? "text-white/50"
                        }`}
                      >
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-white/50">
                        {item.product.name}
                        {item.planLabel && ` — ${item.planLabel}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
