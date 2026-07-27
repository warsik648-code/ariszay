import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";

export default async function AccountProfilePage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div className="ind-panel max-w-lg space-y-4 p-6">
      <p className="tech-label">Profile</p>
      <h2 className="font-display text-2xl font-bold uppercase">Identity</h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-white/40">Email</dt>
          <dd className="text-white/80">{session.user.email}</dd>
        </div>
        <div>
          <dt className="text-white/40">Name</dt>
          <dd className="text-white/80">{session.user.name ?? "—"}</dd>
        </div>
      </dl>
      <p className="text-xs text-white/35">Profile editing will ship in a later update.</p>
    </div>
  );
}
