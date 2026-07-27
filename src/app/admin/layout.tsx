import { redirect } from "next/navigation";
import { getServerSession, isAdminSession } from "@/lib/auth-server";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check: middleware checks for session cookie, but we re-verify role here
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/admin");
  }

  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    redirect("/"); // unauthorized — do not reveal admin exists
  }

  const user = session.user as { name?: string; email?: string; role?: string };

  return (
    <div className="flex min-h-screen bg-[#070a14]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader
          userName={user.name ?? user.email ?? "Admin"}
          userRole={user.role ?? "ADMIN"}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
