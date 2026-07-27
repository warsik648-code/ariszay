import { Shield } from "lucide-react";

type AdminHeaderProps = {
  userName: string;
  userRole: string;
};

export default function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0a0e1a] px-6">
      <div className="flex items-center gap-2 text-sm text-white/40">
        <Shield className="size-3.5" />
        <span>Admin Portal</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-white/40 uppercase">
          {userRole}
        </span>
        <span className="text-white/60">{userName}</span>
      </div>
    </header>
  );
}
