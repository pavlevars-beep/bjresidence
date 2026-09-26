"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReservationStatusBadge } from "./status-badges";
import type { Reservation } from "@/lib/residence/types";

export function ReservationsTable({ reservations: initial, cabinNameById }: { reservations: Reservation[]; cabinNameById: Record<string, string> }) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/residence/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReservations((prev) => prev.map((r) => (r.id === id ? data.reservation : r)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleConvert(reservation: Reservation) {
    let residentInput;
    if (!reservation.residentId) {
      const [firstName, ...rest] = reservation.residentName.split(" ");
      const lastName = rest.join(" ") || "-";
      residentInput = {
        firstName,
        lastName,
        nationality: "",
        dob: "",
        placeOfBirth: "",
        sex: "",
        phone: "",
        email: "",
        notes: "",
        status: "active",
        passportNumber: "",
        passportCountry: "",
        passportIssueDate: "",
        passportExpiryDate: "",
        otherDocType: "",
        otherDocNumber: "",
      };
    }
    setBusyId(reservation.id);
    try {
      const res = await fetch(`/api/admin/residence/reservations/${reservation.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resident: residentInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push(`/admin/residence/residents/${data.residentId}`);
      }
    } finally {
      setBusyId(null);
    }
  }

  if (reservations.length === 0) {
    return <p className="text-sm text-ink/50">Nema rezervacija.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {reservations.map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
          <div>
            <p className="text-sm font-medium text-ink">{cabinNameById[r.cabinId] ?? "—"} — {r.residentName}</p>
            <p className="text-xs text-ink/50">
              Od {r.startDate}{r.expectedEndDate ? ` do ${r.expectedEndDate}` : ""}
              {r.price ? ` · ${r.price} €` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReservationStatusBadge status={r.status} />
            {r.status === "active" && (
              <>
                <Button type="button" variant="outline" onClick={() => handleConvert(r)} disabled={busyId === r.id}>
                  Pretvori u boravak
                </Button>
                <Button type="button" variant="ghost" onClick={() => handleCancel(r.id)} disabled={busyId === r.id}>
                  Otkaži
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
