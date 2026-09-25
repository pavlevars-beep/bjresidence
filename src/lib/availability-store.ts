import { readJsonBlob, writeJsonBlob } from "./blob-store";
import { siteConfig } from "@/config/site";
import { getCabinViews } from "./residence/derive";

export interface AvailabilityState {
  hasFreeSpots: boolean;
  freeSpots: number;
  /** Derived from the real cabin count, not a separate static config value. */
  totalSpots: number;
  overrideEnabled: boolean;
}

interface StoredOverride {
  overrideEnabled: boolean;
  freeSpots: number;
}

/**
 * By default, availability is computed live from cabin occupancy (see
 * residence/derive.ts). An admin-settable override (Website > Availability,
 * or the Telegram /dostupnost [n] command) can pin the public number instead
 * — useful during transitions before real residents are entered, or when
 * the admin wants to advertise a different number than the raw cabin count.
 * Persisted via blob-store.ts; falls back to the static siteConfig value
 * (with the override left ON) until the admin explicitly sets it, since
 * cabins seed with no residents and would otherwise show 4/4 immediately.
 */
const BLOB_PATH = "data/availability.json";

export async function getAvailability(): Promise<AvailabilityState> {
  const [stored, cabinViews] = await Promise.all([readJsonBlob<Partial<StoredOverride>>(BLOB_PATH), getCabinViews()]);

  const totalSpots = cabinViews.length || siteConfig.capacity.totalSpots;
  const computedFreeSpots = cabinViews.filter((v) => v.liveStatus === "available").length;

  if (!stored) {
    // Never configured yet — bridge with the static config value rather than
    // showing the freshly-seeded (all-available) cabin count.
    const freeSpots = siteConfig.availability.freeSpots;
    return { hasFreeSpots: freeSpots > 0, freeSpots, totalSpots, overrideEnabled: true };
  }

  const overrideEnabled = Boolean(stored.overrideEnabled);
  const freeSpots = overrideEnabled ? Number(stored.freeSpots) || 0 : computedFreeSpots;

  return { hasFreeSpots: freeSpots > 0, freeSpots, totalSpots, overrideEnabled };
}

export async function setAvailabilityOverride(enabled: boolean, freeSpots?: number): Promise<AvailabilityState> {
  const state: StoredOverride = { overrideEnabled: enabled, freeSpots: enabled ? Math.max(0, freeSpots ?? 0) : 0 };
  await writeJsonBlob(BLOB_PATH, state);
  return getAvailability();
}

/** Back-compat entry point for the Telegram /dostupnost [n] command — enables the override with this value. */
export async function setAvailability(freeSpots: number): Promise<AvailabilityState> {
  return setAvailabilityOverride(true, freeSpots);
}
