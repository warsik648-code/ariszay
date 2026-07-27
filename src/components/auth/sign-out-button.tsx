"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl gap-2"
      onClick={handleSignOut}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
