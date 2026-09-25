import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import { computeCurrentPeriod } from "./date-math";
import type { ContinuationStatus, Stay } from "./types";

const BLOB_PATH = "data/residence/stays.json";

export async function getStays(): Promise<Stay[]> {
  return readCollection<Stay>(BLOB_PATH);
}

export async function getStay(id: string): Promise<Stay | null> {
  const items = await getStays();
  return items.find((s) => s.id === id) ?? null;
}

export async function getStaysForResident(residentId: string): Promise<Stay[]> {
  const items = await getStays();
  return items.filter((s) => s.residentId === residentId);
}

export async function getStaysForCabin(cabinId: string): Promise<Stay[]> {
  const items = await getStays();
  return items.filter((s) => s.cabinId === cabinId);
}

export async function getActiveStayForCabin(cabinId: string): Promise<Stay | null> {
  const items = await getStays();
  return items.find((s) => s.cabinId === cabinId && s.status === "active") ?? null;
}

export type NewStayInput = {
  residentId: string;
  cabinId: string;
  moveInDate: string;
  estimatedDurationLabel?: string;
  expectedMoveOutDate?: string | null;
  monthlyRent: number;
  currency?: string;
  status?: "active" | "planned";
};

/** Creates a Stay with its first rent period computed from moveInDate. */
export async function createStay(input: NewStayInput): Promise<Stay> {
  const items = await getStays();
  const now = new Date().toISOString();
  const { currentPeriodStart, currentPeriodEnd } = computeCurrentPeriod(input.moveInDate);

  const stay: Stay = {
    id: randomUUID(),
    residentId: input.residentId,
    cabinId: input.cabinId,
    moveInDate: input.moveInDate,
    estimatedDurationLabel: input.estimatedDurationLabel ?? "",
    expectedMoveOutDate: input.expectedMoveOutDate ?? null,
    actualMoveOutDate: null,
    status: input.status ?? "active",
    monthlyRent: input.monthlyRent,
    currency: input.currency ?? "€",
    currentPeriodStart,
    currentPeriodEnd,
    continuationStatus: "undecided",
    reminder7dSentAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await writeCollection(BLOB_PATH, [...items, stay]);
  return stay;
}

async function saveStay(items: Stay[], updated: Stay): Promise<Stay> {
  const index = items.findIndex((s) => s.id === updated.id);
  const next = [...items];
  if (index === -1) next.push(updated);
  else next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}

/**
 * Recomputes the paid-through period from a newly recorded rent payment,
 * resets the continuation decision for the new cycle, and clears the
 * reminder dedupe marker. Called only from the payments API — the one place
 * this rule needs to live so it can't be forgotten on another code path.
 */
export async function advancePeriodFromPayment(
  stayId: string,
  explicitPeriod?: { periodFrom: string; periodTo: string } | null
): Promise<Stay | null> {
  const items = await getStays();
  const stay = items.find((s) => s.id === stayId);
  if (!stay) return null;

  const { currentPeriodStart, currentPeriodEnd } = explicitPeriod
    ? { currentPeriodStart: explicitPeriod.periodFrom, currentPeriodEnd: explicitPeriod.periodTo }
    : computeCurrentPeriod(stay.moveInDate, stay.currentPeriodEnd);

  const updated: Stay = {
    ...stay,
    currentPeriodStart,
    currentPeriodEnd,
    continuationStatus: "undecided",
    reminder7dSentAt: null,
    updatedAt: new Date().toISOString(),
  };
  return saveStay(items, updated);
}

export async function setContinuationStatus(
  stayId: string,
  status: ContinuationStatus,
  expectedMoveOutDate?: string | null
): Promise<Stay | null> {
  const items = await getStays();
  const stay = items.find((s) => s.id === stayId);
  if (!stay) return null;

  const updated: Stay = {
    ...stay,
    continuationStatus: status,
    expectedMoveOutDate: status === "moving_out" ? (expectedMoveOutDate ?? stay.expectedMoveOutDate) : stay.expectedMoveOutDate,
    updatedAt: new Date().toISOString(),
  };
  return saveStay(items, updated);
}

export async function endStay(stayId: string, actualMoveOutDate: string): Promise<Stay | null> {
  const items = await getStays();
  const stay = items.find((s) => s.id === stayId);
  if (!stay) return null;

  const updated: Stay = {
    ...stay,
    status: "ended",
    actualMoveOutDate,
    updatedAt: new Date().toISOString(),
  };
  return saveStay(items, updated);
}

/** Moves a resident to a new cabin: ends the old Stay, creates a new one, preserving history. */
export async function moveCabin(
  stayId: string,
  newCabinId: string,
  moveDate: string
): Promise<{ endedStay: Stay; newStay: Stay } | null> {
  const items = await getStays();
  const stay = items.find((s) => s.id === stayId);
  if (!stay) return null;

  const endedStay: Stay = { ...stay, status: "ended", actualMoveOutDate: moveDate, updatedAt: new Date().toISOString() };
  const withEnded = await saveStay(items, endedStay);

  const newStay = await createStay({
    residentId: stay.residentId,
    cabinId: newCabinId,
    moveInDate: moveDate,
    estimatedDurationLabel: stay.estimatedDurationLabel,
    expectedMoveOutDate: stay.expectedMoveOutDate,
    monthlyRent: stay.monthlyRent,
    currency: stay.currency,
    status: "active",
  });

  return { endedStay: withEnded, newStay };
}
