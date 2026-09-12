import Image from "next/image";
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
    <div className="min-h-screen bg-beige/30 pb-20">
      <header className="sticky top-0 z-20 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/images/brand/icon-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold leading-tight text-ink">BJ Residence</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wood">Info Point Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/info-point"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
            >
              <ExternalLink size={15} /> Preview
            </Link>
            <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5">
              ← Admin
            </Link>
          </div>
        </div>
        <InfoPointAdminNav />
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
