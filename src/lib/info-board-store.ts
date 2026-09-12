import { readJsonBlob, writeJsonBlob } from "./blob-store";
import { defaultInfoBoardConfig, type InfoBoardConfig } from "./info-board";

/**
 * Runtime-editable Info Board configuration, written by the /admin panel and
 * read by the /info kiosk board. Persisted via blob-store.ts (Vercel Blob in
 * production, a local JSON file in dev) — see that file for why.
 */
const BLOB_PATH = "data/info-board.json";

export async function getInfoBoardConfig(): Promise<InfoBoardConfig> {
  const defaults = defaultInfoBoardConfig();
  const parsed = await readJsonBlob<Partial<InfoBoardConfig>>(BLOB_PATH);
  if (!parsed) return defaults;

  return {
    ...defaults,
    ...parsed,
    cleaning: { ...defaults.cleaning, ...parsed.cleaning },
    announcement: { ...defaults.announcement, ...parsed.announcement },
    residenceInfo: { ...defaults.residenceInfo, ...parsed.residenceInfo },
    qr: { ...defaults.qr, ...parsed.qr },
    weeklyItems: Array.isArray(parsed.weeklyItems) ? parsed.weeklyItems : defaults.weeklyItems,
    trafficDestinations: Array.isArray(parsed.trafficDestinations)
      ? parsed.trafficDestinations
      : defaults.trafficDestinations,
  };
}

export async function setInfoBoardConfig(config: InfoBoardConfig): Promise<InfoBoardConfig> {
  const next: InfoBoardConfig = { ...config, updatedAt: new Date().toISOString() };
  await writeJsonBlob(BLOB_PATH, next);
  return next;
}
