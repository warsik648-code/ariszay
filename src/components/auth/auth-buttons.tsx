"use client";

import { useSession } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

export function AuthButtons() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="size-8 rounded-xl bg-white/5 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-xl"
        aria-label="My account"
      >
        <Link href="/account">
          <UserRound className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm" className="rounded-xl">
      <Link href="/auth/sign-in">Sign in</Link>
    </Button>
  );
}
