"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { inputClass, Field } from "@/components/admin/ui";

export interface StayHistoryRow {
  stayId: string;
  residentId: string;
  residentName: string;
  passportNumber: string;
  cabinName: string;
  moveInDate: string;
  moveOutDate: string | null;
  status: string;
  durationDays: number;
  totalRentPaid: number;
  currency: string;
  depositStatus: string;
}

export function StayHistorySearch({ rows }: { rows: StayHistoryRow[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${r.residentName} ${r.passportNumber} ${r.cabinName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (from && r.moveInDate < from) return false;
      if (to && r.moveInDate > to) return false;
      return true;
    });
  }, [rows, query, from, to]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ime, pasoš ili kabina..."
            className={`${inputClass} pl-10`}
          />
        </div>
        <Field label="Od datuma useljenja"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} /></Field>
        <Field label="Do datuma useljenja"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} /></Field>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/50">Nema rezultata.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.slice(0, 200).map((r) => (
            <li key={r.stayId}>
              <Link
                href={`/admin/residence/residents/${r.residentId}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-white p-3.5 hover:border-olive-dark/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{r.residentName} — {r.cabinName}</p>
                  <p className="text-xs text-ink/50">
                    {r.moveInDate} → {r.moveOutDate ?? "sada"} · {r.durationDays}d
                  </p>
                </div>
                <div className="text-right text-xs text-ink/50">
                  <p>{r.totalRentPaid} {r.currency} kirija</p>
                  <p>{r.depositStatus}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
