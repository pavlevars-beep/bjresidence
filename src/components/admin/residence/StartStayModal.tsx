"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Cabin, Resident, Stay } from "@/lib/residence/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StartStayModal({
  residentId,
  cabins,
  onStarted,
  onCancel,
}: {
  residentId: string;
  cabins: Cabin[];
  onStarted: (result: { stay: Stay; resident: Resident }) => void;
  onCancel: () => void;
}) {
  const [cabinId, setCabinId] = useState(cabins[0]?.id ?? "");
  const [moveInDate, setMoveInDate] = useState(todayISO());
  const [estimatedDurationLabel, setEstimatedDurationLabel] = useState("");
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState("");
  const selectedCabin = cabins.find((c) => c.id === cabinId);
  const [monthlyRent, setMonthlyRent] = useState<number>(selectedCabin?.monthlyRentDefault ?? 0);
  const [currency, setCurrency] = useState(selectedCabin?.currency ?? "€");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  function handleCabinChange(id: string) {
    setCabinId(id);
    const cabin = cabins.find((c) => c.id === id);
    if (cabin) {
      setMonthlyRent(cabin.monthlyRentDefault);
      setCurrency(cabin.currency);
    }
  }

  async function handleSubmit() {
    if (!cabinId || !moveInDate || !monthlyRent) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/residence/stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId,
          cabinId,
          moveInDate,
          estimatedDurationLabel,
          expectedMoveOutDate: expectedMoveOutDate || null,
          monthlyRent,
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onStarted({ stay: data.stay, resident: data.resident });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Dodeli kabinu i pokreni boravak</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kabina">
          <select value={cabinId} onChange={(e) => handleCabinChange(e.target.value)} className={inputClass}>
            {cabins.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Datum useljenja">
          <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Mesečna kirija">
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Valuta">
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Planirano trajanje (opciono)">
          <input
            value={estimatedDurationLabel}
            onChange={(e) => setEstimatedDurationLabel(e.target.value)}
            placeholder="npr. 3 meseca"
            className={inputClass}
          />
        </Field>
        <Field label="Očekivano iseljenje (opciono)">
          <input
            type="date"
            value={expectedMoveOutDate}
            onChange={(e) => setExpectedMoveOutDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={status === "saving" || !cabinId}>
          {status === "saving" ? "Pokretanje..." : "Potvrdi useljenje"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška — pokušajte ponovo.</span>}
      </div>
    </div>
  );
}
