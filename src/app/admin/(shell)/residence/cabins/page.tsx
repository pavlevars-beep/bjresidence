import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getCabinViews } from "@/lib/residence/derive";
import { CabinsTable } from "@/components/admin/residence/CabinsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kabine — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function CabinsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const views = await getCabinViews();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Kabine</h1>
        <p className="mt-1 text-sm text-ink/55">Status se automatski izračunava iz boravaka i rezervacija — ovde se ručno podešava samo održavanje.</p>
      </div>
      <CabinsTable initial={views} />
    </div>
  );
}
