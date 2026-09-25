import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import type { ActivityLogEntry } from "./types";

const BLOB_PATH = "data/residence/activity-log.json";
const MAX_ENTRIES = 500;

export async function listActivity(limit = 50): Promise<ActivityLogEntry[]> {
  const items = await readCollection<ActivityLogEntry>(BLOB_PATH);
  return items.slice(0, limit);
}

/**
 * Fire-and-forget by design — logging must never fail or block the action it
 * describes. Call this last in a composite action, after the primary writes
 * have already succeeded.
 */
export async function logActivity(
  action: string,
  summary: string,
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    const items = await readCollection<ActivityLogEntry>(BLOB_PATH);
    const entry: ActivityLogEntry = {
      id: randomUUID(),
      at: new Date().toISOString(),
      action,
      summary,
      entityType,
      entityId,
    };
    const next = [entry, ...items].slice(0, MAX_ENTRIES);
    await writeCollection(BLOB_PATH, next);
  } catch (err) {
    console.error("[residence] activity log write failed:", err);
  }
}
