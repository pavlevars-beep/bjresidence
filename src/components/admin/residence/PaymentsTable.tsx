"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inputClass } from "@/components/admin/ui";
import { formatDateDisplay } from "@/lib/residence/date-math";
import type { Payment } from "@/lib/residence/types";

const TYPE_LABEL: Record<string, string> = {
  rent: "Kirija",
  deposit: "Depozit",
  other: "Ostalo",
  deposit_return: "Povraćaj depozita",
};

export interface PaymentRow extends Payment {
  residentName: string;
  cabinName: string;
}

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const months = useMemo(() => {
    const set = new Set(rows.map((r) => r.paymentDate.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [rows]);

  const [month, setMonth] = useState("");

  const filtered = useMemo(() => {
    if (!month) return rows;
    return rows.filter((r) => r.paymentDate.startsWith(month));
  }, [rows, month]);

  const sorted = [...filtered].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  // Scoped to the selected period (or all payments when "Svi" is chosen) — deposits
  // held is the exception, since it's a current balance, not a period total.
  const revenue = filtered.reduce((s, p) => s + (p.type === "deposit_return" ? -p.amount : p.amount), 0);
  const rentCollected = filtered.filter((p) => p.type === "rent").reduce((s, p) => s + p.amount, 0);
  const depositsCollected = filtered.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0);
  const depositsHeld =
    rows.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0) -
    rows.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);
  const periodLabel = month ? `za ${month}` : "(sve)";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Mesec</span>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${inputClass} max-w-[160px]`}>
          <option value="">Svi</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label={`Prihod ${periodLabel}`} value={`${revenue} €`} />
        <StatTile label={`Naplaćena kirija ${periodLabel}`} value={`${rentCollected} €`} />
        <StatTile label={`Naplaćeni depoziti ${periodLabel}`} value={`${depositsCollected} €`} />
        <StatTile label="Depoziti na čuvanju" value={`${depositsHeld} €`} />
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink/50">Nema uplata za izabrani period.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
              <div>
                <Link href={`/admin/residence/residents/${p.residentId}`} className="text-sm font-medium text-ink hover:underline">
                  {p.residentName}
                </Link>
                <p className="text-xs text-ink/50">
                  {p.cabinName} · {TYPE_LABEL[p.type]}{p.periodFrom && p.periodTo ? ` · ${formatDateDisplay(p.periodFrom)} – ${formatDateDisplay(p.periodTo)}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">{p.amount} {p.currency}</p>
                <p className="text-xs text-ink/40">{formatDateDisplay(p.paymentDate)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
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
