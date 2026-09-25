"use client";

import { useState } from "react";
import Link from "next/link";
import { inputClass, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { CabinStatusBadge, PaymentStatusBadge } from "./status-badges";
import type { CabinView } from "@/lib/residence/derive";

export function CabinsTable({ initial }: { initial: CabinView[] }) {
  const [views, setViews] = useState(initial);

  return (
    <div className="flex flex-col gap-4">
      {views.map((view) => (
        <CabinRow key={view.cabin.id} view={view} onSaved={(updated) => setViews((vs) => vs.map((v) => (v.cabin.id === updated.cabin.id ? updated : v)))} />
      ))}
    </div>
  );
}

function CabinRow({ view, onSaved }: { view: CabinView; onSaved: (v: CabinView) => void }) {
  const [maintenanceFlag, setMaintenanceFlag] = useState(view.cabin.maintenanceFlag);
  const [maintenanceNote, setMaintenanceNote] = useState(view.cabin.maintenanceNote);
  const [monthlyRentDefault, setMonthlyRentDefault] = useState(view.cabin.monthlyRentDefault);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/residence/cabins/${view.cabin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceFlag, maintenanceNote, monthlyRentDefault }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      onSaved({ ...view, cabin: data.cabin, liveStatus: maintenanceFlag ? "maintenance" : view.liveStatus === "maintenance" ? (view.activeStay ? "occupied" : "available") : view.liveStatus });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/admin/residence/cabins/${view.cabin.id}`} className="text-base font-semibold text-ink hover:underline">
            {view.cabin.name}
          </Link>
          <CabinStatusBadge status={maintenanceFlag ? "maintenance" : view.liveStatus === "maintenance" ? (view.activeStay ? "occupied" : "available") : view.liveStatus} />
        </div>
        {view.resident && (
          <p className="text-sm text-ink/60">
            {view.resident.firstName} {view.resident.lastName}
            {view.paymentStatus && (
              <span className="ml-2 inline-block align-middle">
                <PaymentStatusBadge status={view.paymentStatus} />
              </span>
            )}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Toggle checked={maintenanceFlag} onChange={setMaintenanceFlag} label="Na održavanju" />
        <input
          type="text"
          value={maintenanceNote}
          onChange={(e) => setMaintenanceNote(e.target.value)}
          placeholder="Napomena o održavanju"
          className={inputClass}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Cena/mes.</span>
          <input
            type="number"
            value={monthlyRentDefault}
            onChange={(e) => setMonthlyRentDefault(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        {status === "saved" && <span className="text-sm text-olive-dark">Sačuvano.</span>}
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
        <Button onClick={handleSave} disabled={status === "saving"} variant="outline">
          {status === "saving" ? "Čuvanje..." : "Sačuvaj"}
        </Button>
      </div>
    </div>
  );
}
