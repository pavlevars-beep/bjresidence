import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getResidents } from "@/lib/residence/residents-store";
import { getStays } from "@/lib/residence/stays-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { ResidentsTable, type ResidentRow } from "@/components/admin/residence/ResidentsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gosti — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function ResidentsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [residents, stays, cabins] = await Promise.all([getResidents(), getStays(), getCabins()]);
  const cabinById = new Map(cabins.map((c) => [c.id, c]));

  const rows: ResidentRow[] = residents
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((resident) => {
      const activeStay = stays.find((s) => s.residentId === resident.id && s.status === "active");
      const cabinName = activeStay ? cabinById.get(activeStay.cabinId)?.name ?? null : null;
      return { resident, cabinName };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Gosti</h1>
          <p className="mt-1 text-sm text-ink/55">{residents.length} ukupno.</p>
        </div>
        <Link href="/admin/residence/residents/new" className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-medium text-cream hover:bg-[#4a5241]">
          <Plus size={15} /> Dodaj gosta
        </Link>
      </div>
      <ResidentsTable rows={rows} />
    </div>
  );
}
