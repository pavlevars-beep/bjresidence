import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getPayments } from "@/lib/residence/payments-store";
import { getResidents } from "@/lib/residence/residents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { PaymentsTable, type PaymentRow } from "@/components/admin/residence/PaymentsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Uplate — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function PaymentsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [payments, residents, cabins] = await Promise.all([getPayments(), getResidents(), getCabins()]);
  const residentById = new Map(residents.map((r) => [r.id, r]));
  const cabinById = new Map(cabins.map((c) => [c.id, c]));

  const rows: PaymentRow[] = payments.map((p) => ({
    ...p,
    residentName: residentById.get(p.residentId) ? `${residentById.get(p.residentId)!.firstName} ${residentById.get(p.residentId)!.lastName}` : "Nepoznat gost",
    cabinName: cabinById.get(p.cabinId)?.name ?? "—",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Uplate</h1>
        <p className="mt-1 text-sm text-ink/55">Operativna evidencija uplata — ne zamenjuje knjigovodstvo.</p>
      </div>

      <PaymentsTable rows={rows} />
    </div>
  );
}
