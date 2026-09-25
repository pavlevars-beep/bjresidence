import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getStays } from "@/lib/residence/stays-store";
import { getResidents } from "@/lib/residence/residents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { getPayments } from "@/lib/residence/payments-store";
import { daysBetween, todayISO } from "@/lib/residence/date-math";
import { StayHistorySearch, type StayHistoryRow } from "@/components/admin/residence/StayHistorySearch";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Istorija boravaka — BJ Residence Admin", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, string> = { active: "Aktivan", planned: "Planiran", ended: "Završen" };

export default async function StayHistoryPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [stays, residents, cabins, payments] = await Promise.all([getStays(), getResidents(), getCabins(), getPayments()]);
  const residentById = new Map(residents.map((r) => [r.id, r]));
  const cabinById = new Map(cabins.map((c) => [c.id, c]));

  const rows: StayHistoryRow[] = stays
    .map((stay) => {
      const resident = residentById.get(stay.residentId);
      const cabin = cabinById.get(stay.cabinId);
      const stayPayments = payments.filter((p) => p.stayId === stay.id);
      const totalRentPaid = stayPayments.filter((p) => p.type === "rent").reduce((s, p) => s + p.amount, 0);

      const residentDeposits = payments.filter((p) => p.residentId === stay.residentId);
      const depositHeld =
        residentDeposits.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0) -
        residentDeposits.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);

      const endDate = stay.actualMoveOutDate ?? (stay.status === "active" ? todayISO() : null);

      return {
        stayId: stay.id,
        residentId: stay.residentId,
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Nepoznat gost",
        passportNumber: resident?.passportNumber ?? "",
        cabinName: cabin?.name ?? "—",
        moveInDate: stay.moveInDate,
        moveOutDate: stay.actualMoveOutDate,
        status: STATUS_LABEL[stay.status] ?? stay.status,
        durationDays: endDate ? daysBetween(stay.moveInDate, endDate) : 0,
        totalRentPaid,
        currency: stay.currency,
        depositStatus: depositHeld > 0 ? `${depositHeld} € na čuvanju` : "Bez depozita",
      };
    })
    .sort((a, b) => b.moveInDate.localeCompare(a.moveInDate));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Istorija boravaka</h1>
        <p className="mt-1 text-sm text-ink/55">Dugoročna evidencija svih gostiju — istorijski zapisi se ne brišu.</p>
      </div>
      <StayHistorySearch rows={rows} />
    </div>
  );
}
