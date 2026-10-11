"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Stay } from "@/lib/residence/types";

export function StayEditForm({
  stay,
  onSaved,
  onCancel,
}: {
  stay: Stay;
  onSaved: (stay: Stay) => void;
  onCancel: () => void;
}) {
  const [moveInDate, setMoveInDate] = useState(stay.moveInDate);
  const [estimatedDurationLabel, setEstimatedDurationLabel] = useState(stay.estimatedDurationLabel);
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState(stay.expectedMoveOutDate ?? "");
  const [monthlyRent, setMonthlyRent] = useState(String(stay.monthlyRent));
  const [currency, setCurrency] = useState(stay.currency);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/residence/stays/${stay.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moveInDate,
          estimatedDurationLabel,
          expectedMoveOutDate: expectedMoveOutDate || null,
          monthlyRent: Number(monthlyRent),
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onSaved(data.stay);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Datum useljenja"><input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Očekivani datum iseljenja"><input type="date" value={expectedMoveOutDate} onChange={(e) => setExpectedMoveOutDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Procenjeno trajanje"><input value={estimatedDurationLabel} onChange={(e) => setEstimatedDurationLabel(e.target.value)} className={inputClass} /></Field>
        <Field label="Mesečna kirija"><input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className={inputClass} /></Field>
        <Field label="Valuta"><input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? "Čuvanje..." : "Sačuvaj izmene"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
