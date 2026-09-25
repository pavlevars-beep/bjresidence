"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Cabin, Reservation } from "@/lib/residence/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReservationForm({ cabins, onSaved, onCancel }: { cabins: Cabin[]; onSaved: (r: Reservation) => void; onCancel: () => void }) {
  const [cabinId, setCabinId] = useState(cabins[0]?.id ?? "");
  const [residentName, setResidentName] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit() {
    if (!cabinId || !residentName || !startDate) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/residence/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabinId,
          residentName,
          startDate,
          expectedEndDate: expectedEndDate || null,
          price: Number(price) || 0,
          deposit: Number(deposit) || 0,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onSaved(data.reservation);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kabina">
          <select value={cabinId} onChange={(e) => setCabinId(e.target.value)} className={inputClass}>
            {cabins.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Ime gosta / kompanije"><input value={residentName} onChange={(e) => setResidentName(e.target.value)} className={inputClass} /></Field>
        <Field label="Datum početka"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Očekivani kraj (opciono)"><input type="date" value={expectedEndDate} onChange={(e) => setExpectedEndDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Cena"><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} /></Field>
        <Field label="Depozit"><input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={inputClass} /></Field>
        <Field label="Napomena" className="sm:col-span-2"><input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={status === "saving"}>
          {status === "saving" ? "Čuvanje..." : "Sačuvaj rezervaciju"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
