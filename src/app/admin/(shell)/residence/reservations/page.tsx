import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getReservations } from "@/lib/residence/reservations-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { ReservationsPageClient } from "@/components/admin/residence/ReservationsPageClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rezervacije — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function ReservationsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [reservations, cabins] = await Promise.all([getReservations(), getCabins()]);
  const sorted = [...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Rezervacije</h1>
        <p className="mt-1 text-sm text-ink/55">Jednostavne interne rezervacije — kabina se automatski označava kao rezervisana.</p>
      </div>
      <ReservationsPageClient initialReservations={sorted} cabins={cabins} />
    </div>
  );
}
