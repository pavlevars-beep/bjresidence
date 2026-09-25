import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getPayments } from "@/lib/residence/payments-store";
import { getResidents } from "@/lib/residence/residents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { PaymentsTable, type PaymentRow } from "@/components/admin/residence/PaymentsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Uplate — BJ Residence Admin", robots: { index: false, follow: false } };

function currentMonthPrefix(): string {
  return new Date().toISOString().slice(0, 7);
}

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

  const thisMonth = currentMonthPrefix();
  const thisMonthPayments = payments.filter((p) => p.paymentDate.startsWith(thisMonth));
  const rentCollected = thisMonthPayments.filter((p) => p.type === "rent").reduce((s, p) => s + p.amount, 0);
  const depositsCollected = thisMonthPayments.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0);
  const depositsHeld =
    payments.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0) -
    payments.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);
  const monthRevenue = thisMonthPayments.reduce((s, p) => s + (p.type === "deposit_return" ? -p.amount : p.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Uplate</h1>
        <p className="mt-1 text-sm text-ink/55">Operativna evidencija uplata — ne zamenjuje knjigovodstvo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Prihod ovaj mesec" value={`${monthRevenue} €`} />
        <StatTile label="Naplaćena kirija" value={`${rentCollected} €`} />
        <StatTile label="Naplaćeni depoziti" value={`${depositsCollected} €`} />
        <StatTile label="Depoziti na čuvanju" value={`${depositsHeld} €`} />
      </div>

      <PaymentsTable rows={rows} />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/70 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
