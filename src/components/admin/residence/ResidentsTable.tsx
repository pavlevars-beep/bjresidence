"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { ResidentStatusBadge } from "./status-badges";
import type { Resident } from "@/lib/residence/types";

export interface ResidentRow {
  resident: Resident;
  cabinName: string | null;
}

export function ResidentsTable({ rows }: { rows: ResidentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ resident, cabinName }) => {
      const haystack = [
        resident.firstName,
        resident.lastName,
        resident.phone,
        resident.passportNumber,
        cabinName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraga po imenu, telefonu, broju pasoša ili kabini..."
          className={`${inputClass} pl-10`}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/50">Nema rezultata.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.slice(0, 200).map(({ resident, cabinName }) => (
            <li key={resident.id}>
              <Link
                href={`/admin/residence/residents/${resident.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5 hover:border-olive-dark/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{resident.firstName} {resident.lastName}</p>
                  <p className="text-xs text-ink/50">{cabinName ?? "Bez kabine"} {resident.phone && `· ${resident.phone}`}</p>
                </div>
                <ResidentStatusBadge status={resident.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
