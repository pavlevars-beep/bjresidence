"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReservationForm } from "./ReservationForm";
import { ReservationsTable } from "./ReservationsTable";
import type { Cabin, Reservation } from "@/lib/residence/types";

export function ReservationsPageClient({ initialReservations, cabins }: { initialReservations: Reservation[]; cabins: Cabin[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [showForm, setShowForm] = useState(false);
  const cabinNameById = Object.fromEntries(cabins.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> Nova rezervacija
        </Button>
      </div>
      {showForm && (
        <ReservationForm
          cabins={cabins}
          onSaved={(r) => {
            setReservations((prev) => [r, ...prev]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <ReservationsTable reservations={reservations} cabinNameById={cabinNameById} />
    </div>
  );
}
