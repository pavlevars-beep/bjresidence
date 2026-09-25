import { sendTelegramMessage, formatStayReminder } from "../telegram";
import { siteConfig } from "@/config/site";
import { getUpcoming } from "./derive";
import { getNotificationSettings } from "./notification-settings-store";
import { getStays } from "./stays-store";
import { readCollection, writeCollection } from "./collection-store";
import type { Stay } from "./types";

const STAYS_BLOB_PATH = "data/residence/stays.json";
const REMINDER_WINDOW_DAYS = 7;

const CONTINUATION_LABEL: Record<Stay["continuationStatus"], string> = {
  undecided: "Neodlučeno",
  continuing: "Nastavlja boravak",
  moving_out: "Iseljava se",
};

async function markReminderSent(stayId: string): Promise<void> {
  const items = await readCollection<Stay>(STAYS_BLOB_PATH);
  const index = items.findIndex((s) => s.id === stayId);
  if (index === -1) return;
  const next = [...items];
  next[index] = { ...next[index], reminder7dSentAt: new Date().toISOString() };
  await writeCollection(STAYS_BLOB_PATH, next);
}

export interface ReminderSweepResult {
  checked: number;
  sent: number;
  skippedAlreadySent: number;
  skippedDisabled: boolean;
}

/**
 * Checks every active stay whose paid period ends within 7 days and sends a
 * (deduped) Telegram reminder. Shared by the manual "send reminder" button
 * today and, later, a daily Vercel Cron route — both call this one function
 * so the dedupe/formatting logic only exists once.
 */
export async function runReminderSweep(): Promise<ReminderSweepResult> {
  const settings = await getNotificationSettings();
  if (!settings.paymentReminder && !settings.stayContinuationDecision && !settings.expectedMoveOut) {
    return { checked: 0, sent: 0, skippedAlreadySent: 0, skippedDisabled: true };
  }

  const upcoming = await getUpcoming(REMINDER_WINDOW_DAYS);
  const stays = await getStays();
  const stayById = new Map(stays.map((s) => [s.id, s]));

  let sent = 0;
  let skippedAlreadySent = 0;

  for (const item of upcoming) {
    const stay = stayById.get(item.stay.id);
    if (!stay) continue;

    if (item.kind === "move_out" && !settings.expectedMoveOut) continue;
    if (item.kind === "decision_needed" && !settings.stayContinuationDecision) continue;
    if (item.kind === "payment_due" && !settings.paymentReminder) continue;

    // Dedupe: reminder7dSentAt is cleared whenever the period advances (see
    // advancePeriodFromPayment), so a non-null value always means "already
    // sent for the CURRENT period" — no timestamp comparison needed.
    if (stay.reminder7dSentAt) {
      skippedAlreadySent++;
      continue;
    }

    const nextPaymentDue = new Date(stay.currentPeriodEnd);
    nextPaymentDue.setUTCDate(nextPaymentDue.getUTCDate() + 1);

    await sendTelegramMessage(
      formatStayReminder({
        cabinName: item.cabin.name,
        residentName: `${item.resident.firstName} ${item.resident.lastName}`.trim(),
        currentPeriodEnd: stay.currentPeriodEnd,
        nextPaymentDue: nextPaymentDue.toISOString().slice(0, 10),
        daysRemaining: item.daysRemaining,
        continuationStatus: CONTINUATION_LABEL[stay.continuationStatus],
        adminUrl: `${siteConfig.url}/admin/residence/upcoming`,
        kind: item.kind,
      })
    );
    await markReminderSent(stay.id);
    sent++;
  }

  return { checked: upcoming.length, sent, skippedAlreadySent, skippedDisabled: false };
}
