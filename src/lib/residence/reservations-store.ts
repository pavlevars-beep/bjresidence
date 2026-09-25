import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import { createStay } from "./stays-store";
import { createResident, type NewResidentInput } from "./residents-store";
import type { Reservation, ReservationStatus } from "./types";

const BLOB_PATH = "data/residence/reservations.json";

export async function getReservations(): Promise<Reservation[]> {
  return readCollection<Reservation>(BLOB_PATH);
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const items = await getReservations();
  return items.find((r) => r.id === id) ?? null;
}

export async function getActiveReservationForCabin(cabinId: string): Promise<Reservation | null> {
  const items = await getReservations();
  return items.find((r) => r.cabinId === cabinId && r.status === "active") ?? null;
}

export type NewReservationInput = {
  cabinId: string;
  residentName: string;
  residentId?: string | null;
  startDate: string;
  expectedEndDate?: string | null;
  price?: number;
  deposit?: number;
  currency?: string;
  notes?: string;
};

export async function createReservation(input: NewReservationInput): Promise<Reservation> {
  const items = await getReservations();
  const now = new Date().toISOString();
  const reservation: Reservation = {
    id: randomUUID(),
    cabinId: input.cabinId,
    residentName: input.residentName,
    residentId: input.residentId ?? null,
    startDate: input.startDate,
    expectedEndDate: input.expectedEndDate ?? null,
    price: input.price ?? 0,
    deposit: input.deposit ?? 0,
    currency: input.currency ?? "€",
    notes: input.notes ?? "",
    status: "active",
    convertedStayId: null,
    convertedResidentId: null,
    createdAt: now,
    updatedAt: now,
  };
  await writeCollection(BLOB_PATH, [...items, reservation]);
  return reservation;
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
  const items = await getReservations();
  const index = items.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const updated: Reservation = { ...items[index], status, updatedAt: new Date().toISOString() };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}

/**
 * Converts a reservation into a real resident + active stay (creating the
 * resident record first if one wasn't already linked), and marks the
 * reservation "converted" with a trace back to what it became.
 */
export async function convertReservation(
  id: string,
  residentInput?: NewResidentInput
): Promise<{ reservation: Reservation; residentId: string; stayId: string } | null> {
  const items = await getReservations();
  const index = items.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const reservation = items[index];

  let residentId = reservation.residentId;
  if (!residentId) {
    if (!residentInput) throw new Error("resident_input_required");
    const resident = await createResident(residentInput);
    residentId = resident.id;
  }

  const stay = await createStay({
    residentId,
    cabinId: reservation.cabinId,
    moveInDate: reservation.startDate,
    expectedMoveOutDate: reservation.expectedEndDate,
    monthlyRent: reservation.price,
    currency: reservation.currency,
    status: "active",
  });

  const updated: Reservation = {
    ...reservation,
    status: "converted",
    convertedStayId: stay.id,
    convertedResidentId: residentId,
    updatedAt: new Date().toISOString(),
  };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);

  return { reservation: updated, residentId, stayId: stay.id };
}
