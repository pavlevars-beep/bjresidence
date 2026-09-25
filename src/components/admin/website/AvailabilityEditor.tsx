"use client";

import { useState } from "react";
import { Field, inputClass, Toggle } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/info-point/SaveBar";
import { useSavePatch } from "@/components/admin/info-point/useSavePatch";
import type { AvailabilityState } from "@/lib/availability-store";
import type { ResidenceStats } from "@/lib/residence/derive";

export function AvailabilityEditor({ initial, stats }: { initial: AvailabilityState; stats: ResidenceStats }) {
  const [overrideEnabled, setOverrideEnabled] = useState(initial.overrideEnabled);
  const [freeSpots, setFreeSpots] = useState(initial.freeSpots);
  const { status, save } = useSavePatch<{ overrideEnabled: boolean; freeSpots?: number }>("/api/admin/availability-override", "PUT");

  const displayedFree = overrideEnabled ? freeSpots : stats.available;
  const totalSpots = stats.totalCabins;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="rounded-3xl border border-ink/8 bg-white/70 p-6 shadow-soft sm:p-7">
        <h2 className="text-lg font-semibold text-ink">Automatski izračunato iz kabina</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <StatBox label="Ukupno kabina" value={stats.totalCabins} />
          <StatBox label="Zauzeto" value={stats.occupied} />
          <StatBox label="Rezervisano" value={stats.reserved} />
          <StatBox label="Slobodno" value={stats.available} />
        </div>
      </div>

      <div className="rounded-3xl border border-ink/8 bg-white/70 p-6 shadow-soft sm:p-7">
        <h2 className="text-lg font-semibold text-ink">Prikaz na sajtu</h2>
        <p className="mt-1 text-sm text-ink/55">Podrazumevano se automatski izračunava iz statusa kabina. Uključite ručno podešavanje za privremene situacije.</p>

        <div className="mt-4 flex flex-col gap-4">
          <Toggle checked={overrideEnabled} onChange={setOverrideEnabled} label="Ručno podešavanje dostupnosti" />
          {overrideEnabled && (
            <Field label="Broj slobodnih mesta" className="max-w-[200px]">
              <input type="number" min={0} value={freeSpots} onChange={(e) => setFreeSpots(Number(e.target.value))} className={inputClass} />
            </Field>
          )}

          <div className="rounded-2xl bg-beige/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Pregled</p>
            <p className="mt-1 text-lg font-semibold text-ink">Dostupno {displayedFree} od {totalSpots} mesta</p>
          </div>
        </div>
      </div>

      <SaveBar status={status} onSave={() => save({ overrideEnabled, freeSpots: overrideEnabled ? freeSpots : undefined })} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-3 text-center">
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink/50">{label}</p>
    </div>
  );
}
