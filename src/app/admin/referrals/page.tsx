import { db } from "@/lib/db";

export default async function AdminReferralsPage() {
  const referrals = await db.referral.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { email: true, name: true } },
      _count: { select: { clicks: true, conversions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Referrals</h1>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left bg-white/2">
              <th className="px-4 py-3 font-medium text-white/50">Code</th>
              <th className="px-4 py-3 font-medium text-white/50">Owner</th>
              <th className="px-4 py-3 font-medium text-white/50">Commission</th>
              <th className="px-4 py-3 font-medium text-white/50">Clicks</th>
              <th className="px-4 py-3 font-medium text-white/50">Conversions</th>
              <th className="px-4 py-3 font-medium text-white/50">Active</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                  No referral codes yet
                </td>
              </tr>
            ) : (
              referrals.map((ref) => (
                <tr key={ref.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-white">{ref.code}</td>
                  <td className="px-4 py-3 text-white/60">{ref.owner.email}</td>
                  <td className="px-4 py-3 text-white/60">{Number(ref.commissionPercent)}%</td>
                  <td className="px-4 py-3 text-white/50">{ref._count.clicks}</td>
                  <td className="px-4 py-3 text-white/50">{ref._count.conversions}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${ref.active ? "text-emerald-400" : "text-white/30"}`}>
                      {ref.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
