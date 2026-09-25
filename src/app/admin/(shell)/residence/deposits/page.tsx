import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
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

  const rows = residents
    .map((resident) => {
      const residentPayments = payments.filter((p) => p.residentId === resident.id);
      const paid = residentPayments.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0);
      const returned = residentPayments.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);
      const held = paid - returned;
      const activeStay = stays.find((s) => s.residentId === resident.id && s.status === "active");
      const cabinName = activeStay ? cabinById.get(activeStay.cabinId)?.name ?? null : null;
      return { resident, paid, returned, held, cabinName, isActive: !!activeStay, missing: !!activeStay && held <= 0 };
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

      {rows.length === 0 ? (
        <p className="text-sm text-ink/50">Nema depozita.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(({ resident, paid, returned, held, cabinName, missing }) => (
            <li key={resident.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
              <div>
                <Link href={`/admin/residence/residents/${resident.id}`} className="text-sm font-medium text-ink hover:underline">
                  {resident.firstName} {resident.lastName}
                </Link>
                <p className="text-xs text-ink/50">
                  {cabinName ?? "Bez kabine"}
                  {missing ? "" : ` · Uplaćeno ${paid} €${returned > 0 ? ` · Vraćeno ${returned} €` : ""}`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  missing ? "bg-red-50 text-red-700" : held > 0 ? "bg-olive-dark/10 text-olive-dark" : "bg-ink/5 text-ink/50"
                }`}
              >
                {missing ? "Nedostaje depozit" : held > 0 ? `${held} € na čuvanju` : "Vraćen"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
