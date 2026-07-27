import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "OWNER", "SUPPORT", "CONTENT_MANAGER", "ANALYST"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const roleColors: Record<string, string> = {
    OWNER: "text-yellow-400 bg-yellow-500/10",
    ADMIN: "text-primary bg-primary/10",
    SUPPORT: "text-blue-400 bg-blue-500/10",
    CONTENT_MANAGER: "text-purple-400 bg-purple-500/10",
    ANALYST: "text-white/50 bg-white/5",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Users</h1>

      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/8 p-4">
        <p className="text-sm font-medium text-yellow-400">Security notice</p>
        <p className="mt-1 text-sm text-white/50">
          Admin accounts can only be created by the Owner through the database seed or direct database management. There is no self-registration for admin roles.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left bg-white/2">
              <th className="px-4 py-3 font-medium text-white/50">Email</th>
              <th className="px-4 py-3 font-medium text-white/50">Name</th>
              <th className="px-4 py-3 font-medium text-white/50">Role</th>
              <th className="px-4 py-3 font-medium text-white/50">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/30">
                  No admin users found. Run the seed script to create the first admin.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white/80">{user.email}</td>
                  <td className="px-4 py-3 text-white/50">{user.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        roleColors[user.role] ?? "text-white/50"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40">
                    {user.createdAt.toLocaleDateString()}
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
