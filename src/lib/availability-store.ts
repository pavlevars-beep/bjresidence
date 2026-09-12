import { readJsonBlob, writeJsonBlob } from "./blob-store";
import { siteConfig } from "@/config/site";

export interface AvailabilityState {
  hasFreeSpots: boolean;
  freeSpots: number;
}

/**
 * Runtime-editable override for siteConfig.availability, written by the
 * Telegram /dostupnost command. Persisted via blob-store.ts; falls back to
 * the static config value when no override exists yet.
 */
const BLOB_PATH = "data/availability.json";

export async function getAvailability(): Promise<AvailabilityState> {
  const parsed = await readJsonBlob<Partial<AvailabilityState>>(BLOB_PATH);
  if (!parsed) return { ...siteConfig.availability };
  return {
    hasFreeSpots: Boolean(parsed.hasFreeSpots),
    freeSpots: Number(parsed.freeSpots) || 0,
  };
}

export async function setAvailability(freeSpots: number): Promise<AvailabilityState> {
  const state: AvailabilityState = {
    freeSpots,
    hasFreeSpots: freeSpots > 0,
  };
  await writeJsonBlob(BLOB_PATH, state);
  return state;
}
