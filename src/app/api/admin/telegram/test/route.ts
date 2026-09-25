import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    await sendTelegramMessage("BJ Residence — test poruka iz admin panela. Ako ovo vidite, Telegram veza radi.");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram/test]", err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
