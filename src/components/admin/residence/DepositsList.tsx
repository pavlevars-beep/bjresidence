"use client";

import { useState } from "react";
import Link from "next/link";

export interface DepositRow {
  residentId: string;
  residentName: string;
  cabinName: string | null;
  paid: number;
  returned: number;
  held: number;
  currency: string;
  missing: boolean;
  stayId: string | null;
  cabinId: string | null;
}

export function DepositsList({ rows: initialRows }: { rows: DepositRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [returningId, setReturningId] = useState<string | null>(null);

  async function handleReturn(row: DepositRow) {
    if (!row.stayId || !row.cabinId) return;
    if (!confirm(`Vratiti depozit od ${row.held} ${row.currency} gostu ${row.residentName}?`)) return;

    setReturningId(row.residentId);
    try {
      const res = await fetch("/api/admin/residence/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId: row.residentId,
          cabinId: row.cabinId,
          stayId: row.stayId,
          type: "deposit_return",
          amount: row.held,
          currency: row.currency,
          paymentDate: new Date().toISOString().slice(0, 10),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setRows((prev) =>
        prev.map((r) => (r.residentId === row.residentId ? { ...r, returned: r.returned + r.held, held: 0 } : r))
      );
    } finally {
      setReturningId(null);
    }
  }

  if (rows.length === 0) {
    return <p className="text-sm text-ink/50">Nema depozita.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.residentId}
          className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5"
        >
          <div>
            <Link href={`/admin/residence/residents/${row.residentId}`} className="text-sm font-medium text-ink hover:underline">
              {row.residentName}
            </Link>
            <p className="text-xs text-ink/50">
              {row.cabinName ?? "Bez kabine"}
              {row.missing ? "" : ` · Uplaćeno ${row.paid} ${row.currency}${row.returned > 0 ? ` · Vraćeno ${row.returned} ${row.currency}` : ""}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {row.held > 0 && (
              <button
                type="button"
                onClick={() => handleReturn(row)}
                disabled={returningId === row.residentId}
                className="rounded-full border border-olive-dark/30 px-3 py-1.5 text-xs font-medium text-olive-dark hover:bg-olive-dark/10 disabled:opacity-50"
              >
                {returningId === row.residentId ? "Čuvanje..." : "Vrati depozit"}
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                row.missing ? "bg-red-50 text-red-700" : row.held > 0 ? "bg-olive-dark/10 text-olive-dark" : "bg-ink/5 text-ink/50"
              }`}
            >
              {row.missing ? "Nedostaje depozit" : row.held > 0 ? `${row.held} ${row.currency} na čuvanju` : "Vraćen"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
