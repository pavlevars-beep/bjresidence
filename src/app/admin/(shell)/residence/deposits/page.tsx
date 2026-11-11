import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { DepositsList, type DepositRow } from "@/components/admin/residence/DepositsList";
import { getPayments } from "@/lib/residence/payments-store";
import { getResidents } from "@/lib/residence/residents-store";
import { getStays } from "@/lib/residence/stays-store";
import { getCabins } from "@/lib/residence/cabins-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Depoziti — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function DepositsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [payments, residents, stays, cabins] = await Promise.all([getPayments(), getResidents(), getStays(), getCabins()]);
  const cabinById = new Map(cabins.map((c) => [c.id, c]));

  const rows: (DepositRow & { isActive: boolean })[] = residents
    .map((resident) => {
      const residentPayments = payments.filter((p) => p.residentId === resident.id);
      const paid = residentPayments.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0);
      const returned = residentPayments.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);
      const held = paid - returned;
      const activeStay = stays.find((s) => s.residentId === resident.id && s.status === "active");
      // Deposit returns commonly happen after move-out — fall back to the
      // most recent stay on record so there's still a stay/cabin to attach
      // the return payment to.
      const residentStays = stays
        .filter((s) => s.residentId === resident.id)
        .sort((a, b) => b.moveInDate.localeCompare(a.moveInDate));
      const relevantStay = activeStay ?? residentStays[0] ?? null;
      const cabinName = activeStay ? cabinById.get(activeStay.cabinId)?.name ?? null : null;
      return {
        residentId: resident.id,
        residentName: `${resident.firstName} ${resident.lastName}`,
        paid,
        returned,
        held,
        currency: relevantStay?.currency ?? "€",
        cabinName,
        stayId: relevantStay?.id ?? null,
        cabinId: relevantStay?.cabinId ?? null,
        isActive: !!activeStay,
        missing: !!activeStay && held <= 0,
      };
    })
    // Keep anyone with deposit history, plus every currently active resident
    // (even with zero deposit — that's exactly what needs surfacing here).
    .filter((r) => r.paid > 0 || r.isActive)
    .sort((a, b) => {
      if (a.missing !== b.missing) return a.missing ? -1 : 1;
      return b.held - a.held;
    });

  const totalHeld = rows.reduce((s, r) => s + r.held, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Depoziti</h1>
        <p className="mt-1 text-sm text-ink/55">Ukupno na čuvanju: <span className="font-semibold text-ink">{totalHeld} €</span></p>
      </div>

      <DepositsList rows={rows} />
    </div>
  );
}
