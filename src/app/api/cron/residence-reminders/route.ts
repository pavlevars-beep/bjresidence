import { NextResponse } from "next/server";
import { runReminderSweep } from "@/lib/residence/reminders";

export const dynamic = "force-dynamic";

/**
 * Invoked by Vercel Cron (see vercel.json) once a day. Vercel automatically
 * sends `Authorization: Bearer $CRON_SECRET` when that env var is set on the
 * project — this route just verifies it, then calls the same sweep function
 * the manual "Pošalji podsetnike" button already uses, so dedupe/formatting
 * logic only exists in one place.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await runReminderSweep();
  return NextResponse.json({ ok: true, ...result });
}
