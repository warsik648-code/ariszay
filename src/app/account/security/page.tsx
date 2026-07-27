import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/auth-server";

export default async function AccountSecurityPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div className="ind-panel max-w-lg space-y-4 p-6">
      <p className="tech-label">Security</p>
      <h2 className="font-display text-2xl font-bold uppercase">Access</h2>
      <p className="text-sm text-white/50">
        Reset your password from the signed-out recovery flow.
      </p>
      <Link href="/auth/forgot-password" className="text-sm text-primary underline">
        Forgot password
      </Link>
    </div>
  );
}
