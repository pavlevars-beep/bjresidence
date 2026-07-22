import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "@/config/site";

export interface AvailabilityState {
  hasFreeSpots: boolean;
  freeSpots: number;
}

/**
 * Runtime-editable override for siteConfig.availability, written to disk by the
 * Telegram /dostupnost command. Falls back to the static config value when no
 * override exists yet (fresh deploy, or when running on a read-only filesystem).
 */
const filePath = path.join(process.cwd(), "data", "availability.json");

export async function getAvailability(): Promise<AvailabilityState> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      hasFreeSpots: Boolean(parsed.hasFreeSpots),
      freeSpots: Number(parsed.freeSpots) || 0,
    };
  } catch {
    return { ...siteConfig.availability };
  }
}

export async function setAvailability(freeSpots: number): Promise<AvailabilityState> {
  const state: AvailabilityState = {
    freeSpots,
    hasFreeSpots: freeSpots > 0,
  };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(state, null, 2));
  return state;
}
