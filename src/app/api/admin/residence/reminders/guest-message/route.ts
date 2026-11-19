import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendGuestMessage } from "@/lib/residence/reminders";

export const dynamic = "force-dynamic";

/** Sends the ready-to-forward guest message for one stay to the owner's Telegram. */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { stayId?: string } | null;
  if (!body?.stayId) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const sent = await sendGuestMessage(body.stayId);
  if (!sent) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
