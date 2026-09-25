"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inputClass } from "@/components/admin/ui";
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

  const [month, setMonth] = useState(months[0] ?? "");

  const filtered = useMemo(() => {
    if (!month) return rows;
    return rows.filter((r) => r.paymentDate.startsWith(month));
  }, [rows, month]);

  const sorted = [...filtered].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

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
                  {p.cabinName} · {TYPE_LABEL[p.type]}{p.periodFrom && p.periodTo ? ` · ${p.periodFrom} – ${p.periodTo}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">{p.amount} {p.currency}</p>
                <p className="text-xs text-ink/40">{p.paymentDate}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
