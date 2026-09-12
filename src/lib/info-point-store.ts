import { readJsonBlob, writeJsonBlob } from "./blob-store";
import { defaultInfoPointConfig, type InfoPointConfig } from "./info-point";

/**
 * Runtime-editable Info Point content, written by the /admin panel and read
 * by the public /info-point guide. Persisted via blob-store.ts (Vercel Blob
 * in production, a local JSON file in dev) — see that file for why.
 */
const BLOB_PATH = "data/info-point.json";

export async function getInfoPointConfig(): Promise<InfoPointConfig> {
  const defaults = defaultInfoPointConfig();
  const parsed = await readJsonBlob<Partial<InfoPointConfig>>(BLOB_PATH);
  if (!parsed) return defaults;

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
}

export async function setInfoPointConfig(config: InfoPointConfig): Promise<InfoPointConfig> {
  const next: InfoPointConfig = { ...config, updatedAt: new Date().toISOString() };
  await writeJsonBlob(BLOB_PATH, next);
  return next;
}
