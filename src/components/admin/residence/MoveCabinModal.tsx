"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Cabin, Stay } from "@/lib/residence/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MoveCabinModal({
  stay,
  cabins,
  onMoved,
  onCancel,
}: {
  stay: Stay;
  cabins: Cabin[];
  onMoved: (result: { endedStay: Stay; newStay: Stay }) => void;
  onCancel: () => void;
}) {
  const otherCabins = cabins.filter((c) => c.id !== stay.cabinId);
  const [newCabinId, setNewCabinId] = useState(otherCabins[0]?.id ?? "");
  const [moveDate, setMoveDate] = useState(todayISO());
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit() {
    if (!newCabinId) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/residence/stays/${stay.id}/move-cabin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newCabinId, moveDate }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onMoved({ endedStay: data.endedStay, newStay: data.newStay });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nova kabina">
          <select value={newCabinId} onChange={(e) => setNewCabinId(e.target.value)} className={inputClass}>
            {otherCabins.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Datum premeštaja">
          <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={status === "saving"}>
          {status === "saving" ? "Premeštanje..." : "Potvrdi premeštaj"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
