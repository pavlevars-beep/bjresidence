import { promises as fs } from "fs";
import path from "path";
import { defaultInfoBoardConfig, type InfoBoardConfig } from "./info-board";

/**
 * Runtime-editable Info Board configuration, written to disk by the /admin panel
 * and read by the /info kiosk board. Same pattern as availability-store.ts: falls
 * back to sensible defaults when no file exists yet or the filesystem is read-only.
 */
const filePath = path.join(process.cwd(), "data", "info-board.json");

export async function getInfoBoardConfig(): Promise<InfoBoardConfig> {
  const defaults = defaultInfoBoardConfig();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
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
  } catch {
    return defaults;
  }
}

export async function setInfoBoardConfig(config: InfoBoardConfig): Promise<InfoBoardConfig> {
  const next: InfoBoardConfig = { ...config, updatedAt: new Date().toISOString() };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2));
  return next;
}
