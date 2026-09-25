"use client";

import { useState } from "react";
import Link from "next/link";
import { StayDecisionControl } from "./StayDecisionControl";
import type { Cabin, Resident, Stay } from "@/lib/residence/types";

export interface UpcomingRow {
  kind: "payment_due" | "move_out" | "decision_needed";
  stay: Stay;
  cabin: Cabin;
  resident: Resident;
  date: string;
  daysRemaining: number;
}

const KIND_LABEL: Record<UpcomingRow["kind"], string> = {
  decision_needed: "Potrebna odluka o nastavku boravka",
  payment_due: "Uplata dospeva",
  move_out: "Očekivano iseljenje",
};

export function UpcomingDecisionsList({ initial }: { initial: UpcomingRow[] }) {
  const [rows, setRows] = useState(initial);

  if (rows.length === 0) {
    return <p className="text-sm text-ink/50">Ništa ne zahteva pažnju u narednih 7 dana.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={`${row.kind}-${row.stay.id}`} className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-wood">{KIND_LABEL[row.kind]}</p>
              <Link href={`/admin/residence/residents/${row.resident.id}`} className="text-base font-semibold text-ink hover:underline">
                {row.cabin.name} — {row.resident.firstName} {row.resident.lastName}
              </Link>
              <p className="text-sm text-ink/50">{row.date} · {row.daysRemaining <= 0 ? "Danas/isteklo" : `za ${row.daysRemaining} dana`}</p>
            </div>
          </div>
          <div className="mt-3">
            <StayDecisionControl
              stay={row.stay}
              onUpdated={(updated) => setRows((prev) => prev.map((r) => (r.stay.id === updated.id ? { ...r, stay: updated } : r)))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
