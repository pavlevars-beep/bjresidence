import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import type { Resident } from "./types";

const BLOB_PATH = "data/residence/residents.json";

export async function getResidents(): Promise<Resident[]> {
  return readCollection<Resident>(BLOB_PATH);
}

export async function getResident(id: string): Promise<Resident | null> {
  const items = await getResidents();
  return items.find((r) => r.id === id) ?? null;
}

export type NewResidentInput = Omit<Resident, "id" | "createdAt" | "updatedAt">;

export async function createResident(input: NewResidentInput): Promise<Resident> {
  const items = await getResidents();
  const now = new Date().toISOString();
  const resident: Resident = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  await writeCollection(BLOB_PATH, [...items, resident]);
  return resident;
}

export async function updateResident(id: string, patch: Partial<Resident>): Promise<Resident | null> {
  const items = await getResidents();
  const index = items.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: Resident = { ...items[index], ...patch, id, updatedAt: new Date().toISOString() };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}
