import { readJsonBlob, writeJsonBlob } from "../blob-store";
import type { NotificationSettings } from "./types";

const BLOB_PATH = "data/notification-settings.json";

function defaults(): NotificationSettings {
  return {
    paymentReminder: true,
    stayContinuationDecision: true,
    expectedMoveOut: true,
    overduePayment: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const parsed = await readJsonBlob<Partial<NotificationSettings>>(BLOB_PATH);
  if (!parsed) return defaults();
  return { ...defaults(), ...parsed };
}

export async function setNotificationSettings(patch: Partial<NotificationSettings>): Promise<NotificationSettings> {
  const current = await getNotificationSettings();
  const next: NotificationSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeJsonBlob(BLOB_PATH, next);
  return next;
}
