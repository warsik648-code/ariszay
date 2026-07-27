"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Gamepad2,
  Users,
  Tag,
  Share2,
  FileText,
  Shield,
  LifeBuoy,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
  { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/referrals", label: "Referrals", icon: Share2 },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/users", label: "Admin Users", icon: Shield },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#0a0e1a] md:flex md:flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-white">
          Aris<span className="text-primary">Zay</span>{" "}
          <span className="text-xs font-normal text-white/30">Ops</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
