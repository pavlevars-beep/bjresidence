import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { InfoPointAdminNav } from "@/components/admin/info-point/InfoPointAdminNav";

export default function InfoPointAdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="rounded-3xl border border-ink/8 bg-white/70 p-4 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wood">Info Point Admin</p>
          <Link
            href="/info-point"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
          >
            <ExternalLink size={15} /> Preview
          </Link>
        </div>
        <InfoPointAdminNav />
      </div>

      {children}
    </div>
  );
}
