import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAvailability } from "@/lib/availability-store";
import { getResidenceStats } from "@/lib/residence/derive";
import { AvailabilityEditor } from "@/components/admin/website/AvailabilityEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dostupnost — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function WebsiteAvailabilityPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [availability, stats] = await Promise.all([getAvailability(), getResidenceStats()]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dostupnost na sajtu</h1>
        <p className="mt-1 text-sm text-ink/55">Šta posetioci vide na javnom sajtu.</p>
      </div>
      <AvailabilityEditor initial={availability} stats={stats} />
    </div>
  );
}
