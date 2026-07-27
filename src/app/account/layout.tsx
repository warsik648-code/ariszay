import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, LifeBuoy, RotateCcw, User, Shield, LayoutDashboard } from "lucide-react";

import { getServerSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import SignOutButton from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/tickets", label: "Tickets", icon: LifeBuoy },
  { href: "/account/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: Shield },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in?redirect=/account");

  const unread = await db.notification
    .count({ where: { userId: session.user.id, readAt: null } })
    .catch(() => 0);

  return (
    <div className="container-site py-10 pb-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[rgb(242_240_235_/_0.1)] pb-6">
        <div>
          <p className="tech-label text-primary mb-2">Mission Control</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#f2f0eb] uppercase sm:text-4xl">
            Account
          </h1>
          <p className="mt-1 text-sm text-[rgb(242_240_235_/_0.45)]">{session.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary">
              {unread} alerts
            </span>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <AccountNavLink key={href} href={href} label={label} icon={Icon} exact={exact} />
          ))}
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AccountNavLink({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}) {
  // Server component can't use usePathname — render plain links; active state via CSS is hard.
  // Use a client wrapper instead.
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 border border-transparent px-3 py-2.5 font-display text-sm font-semibold tracking-wide uppercase text-[rgb(242_240_235_/_0.45)] transition-colors hover:border-[rgb(242_240_235_/_0.1)] hover:bg-[rgb(200_255_0_/_0.04)] hover:text-primary",
      )}
      data-exact={exact ? "1" : undefined}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
