import { readCollection, writeCollection } from "./collection-store";
import type { Cabin } from "./types";

const BLOB_PATH = "data/residence/cabins.json";

function seedCabins(): Cabin[] {
  const now = new Date().toISOString();
  const base = [
    { id: "1", number: 1, name: "Sava" },
    { id: "2", number: 2, name: "Kosmaj" },
    { id: "3", number: 3, name: "Dunav" },
    { id: "4", number: 4, name: "Avala" },
  ];
  return base.map((c) => ({
    ...c,
    maintenanceFlag: false,
    maintenanceNote: "",
    monthlyRentDefault: 250,
    currency: "€",
    notes: "",
    createdAt: now,
    updatedAt: now,
  }));
}

/** Lazily seeds the 4 BJ Residence cabins on first read — no separate migration step needed. */
export async function getCabins(): Promise<Cabin[]> {
  const items = await readCollection<Cabin>(BLOB_PATH);
  if (items.length > 0) return items;
  const seeded = seedCabins();
  await writeCollection(BLOB_PATH, seeded);
  return seeded;
}

export async function getCabin(id: string): Promise<Cabin | null> {
  const items = await getCabins();
  return items.find((c) => c.id === id) ?? null;
}

export async function updateCabin(id: string, patch: Partial<Cabin>): Promise<Cabin | null> {
  const items = await getCabins();
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated: Cabin = { ...items[index], ...patch, id, updatedAt: new Date().toISOString() };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}
