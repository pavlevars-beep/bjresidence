import { promises as fs } from "fs";
import path from "path";
import { defaultInfoPointConfig, type InfoPointConfig } from "./info-point";

/**
 * Runtime-editable Info Point content, written to disk by the /admin panel
 * and read by the public /info-point guide. Same pattern as
 * info-board-store.ts: falls back to defaults when no file exists yet or the
 * filesystem is read-only (e.g. Vercel's serverless runtime — see the
 * project's known Vercel Blob storage follow-up for a durable fix).
 */
const filePath = path.join(process.cwd(), "data", "info-point.json");

export async function getInfoPointConfig(): Promise<InfoPointConfig> {
  const defaults = defaultInfoPointConfig();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaults.categories,
      wifi: { ...defaults.wifi, ...parsed.wifi },
      houseRules: {
        ...defaults.houseRules,
        ...parsed.houseRules,
        sections: Array.isArray(parsed.houseRules?.sections) ? parsed.houseRules.sections : defaults.houseRules.sections,
      },
      deviceGuides: Array.isArray(parsed.deviceGuides) ? parsed.deviceGuides : defaults.deviceGuides,
      nearbyPlaces: Array.isArray(parsed.nearbyPlaces) ? parsed.nearbyPlaces : defaults.nearbyPlaces,
      transportRoutes: Array.isArray(parsed.transportRoutes) ? parsed.transportRoutes : defaults.transportRoutes,
      taxiOptions: Array.isArray(parsed.taxiOptions) ? parsed.taxiOptions : defaults.taxiOptions,
      foodLinks: Array.isArray(parsed.foodLinks) ? parsed.foodLinks : defaults.foodLinks,
      workDestinations: Array.isArray(parsed.workDestinations) ? parsed.workDestinations : defaults.workDestinations,
      emergencyContacts: Array.isArray(parsed.emergencyContacts) ? parsed.emergencyContacts : defaults.emergencyContacts,
      contact: { ...defaults.contact, ...parsed.contact },
    };
  } catch {
    return defaults;
  }
}

export async function setInfoPointConfig(config: InfoPointConfig): Promise<InfoPointConfig> {
  const next: InfoPointConfig = { ...config, updatedAt: new Date().toISOString() };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2));
  return next;
}
