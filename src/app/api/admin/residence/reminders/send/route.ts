import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { runReminderSweep } from "@/lib/residence/reminders";

export const dynamic = "force-dynamic";

/** Manual trigger — calls the same sweep function the future daily cron will call. */
export async function POST() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await runReminderSweep();
  return NextResponse.json({ ok: true, ...result });
}
