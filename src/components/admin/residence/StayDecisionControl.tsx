"use client";

import { useState } from "react";
import { inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { ContinuationBadge } from "./status-badges";
import type { ContinuationStatus, Stay } from "@/lib/residence/types";

export function StayDecisionControl({ stay, onUpdated }: { stay: Stay; onUpdated: (stay: Stay) => void }) {
  const [moveOutDate, setMoveOutDate] = useState(stay.expectedMoveOutDate ?? "");
  const [pendingMoveOut, setPendingMoveOut] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  async function setDecision(next: ContinuationStatus, expectedMoveOutDate?: string) {
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/residence/stays/${stay.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, expectedMoveOutDate }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onUpdated(data.stay);
        setPendingMoveOut(false);
      }
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/45">Odluka o nastavku</span>
        <ContinuationBadge status={stay.continuationStatus} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={stay.continuationStatus === "continuing" ? "primary" : "outline"} onClick={() => setDecision("continuing")} disabled={status === "saving"}>
          Nastavlja
        </Button>
        <Button type="button" variant={stay.continuationStatus === "moving_out" ? "primary" : "outline"} onClick={() => setPendingMoveOut(true)} disabled={status === "saving"}>
          Iseljava se
        </Button>
        <Button type="button" variant="ghost" onClick={() => setDecision("undecided")} disabled={status === "saving"}>
          Neodlučeno
        </Button>
      </div>
      {pendingMoveOut && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-white p-3">
          <input type="date" value={moveOutDate} onChange={(e) => setMoveOutDate(e.target.value)} className={inputClass} />
          <Button type="button" onClick={() => setDecision("moving_out", moveOutDate)} disabled={!moveOutDate || status === "saving"}>
            Potvrdi datum iseljenja
          </Button>
          <Button type="button" variant="ghost" onClick={() => setPendingMoveOut(false)}>Otkaži</Button>
        </div>
      )}
    </div>
  );
}
