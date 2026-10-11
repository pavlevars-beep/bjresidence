"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReservationStatusBadge } from "./status-badges";
import { ReservationForm } from "./ReservationForm";
import { formatDateDisplay } from "@/lib/residence/date-math";
import type { Cabin, Reservation } from "@/lib/residence/types";

export function ReservationsTable({
  reservations: initial,
  cabins,
  cabinNameById,
}: {
  reservations: Reservation[];
  cabins: Cabin[];
  cabinNameById: Record<string, string>;
}) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    if (!confirm("Obrisati ovu rezervaciju? Ova radnja se ne može poništiti.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/residence/reservations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
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
      {reservations.map((r) =>
        editingId === r.id ? (
          <li key={r.id}>
            <ReservationForm
              cabins={cabins}
              initial={r}
              onSaved={(updated) => {
                setReservations((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          </li>
        ) : (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
            <div>
              <p className="text-sm font-medium text-ink">{cabinNameById[r.cabinId] ?? "—"} — {r.residentName}</p>
              <p className="text-xs text-ink/50">
                Od {formatDateDisplay(r.startDate)}{r.expectedEndDate ? ` do ${formatDateDisplay(r.expectedEndDate)}` : ""}
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
              <button
                type="button"
                onClick={() => setEditingId(r.id)}
                disabled={busyId === r.id}
                className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/5"
              >
                <Pencil size={13} /> Izmeni
              </button>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                disabled={busyId === r.id}
                className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <Trash2 size={13} /> Obriši
              </button>
            </div>
          </li>
        )
      )}
    </ul>
  );
}
