import { NextResponse } from "next/server";
import { getAvailability, setAvailability } from "@/lib/availability-store";
import { sendTelegramMessage } from "@/lib/telegram";

const HELP_TEXT =
  "Komande:\n" +
  "/dostupnost — prikaži trenutnu dostupnost\n" +
  "/dostupnost [broj] — postavi broj slobodnih mesta, npr. /dostupnost 3 ili /dostupnost 0";

/**
 * Telegram calls this URL (set via setWebhook, see README) whenever someone
 * messages the bot. Only the configured admin chat is allowed to run commands —
 * everything else is ignored.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await request.json();
  const message = update?.message;
  const chatId = message?.chat?.id?.toString();
  const text: string | undefined = message?.text;

  if (!message || !text || chatId !== process.env.TELEGRAM_CHAT_ID) {
    return NextResponse.json({ ok: true });
  }

  const [command, arg] = text.trim().split(/\s+/);

  if (command === "/dostupnost") {
    if (arg === undefined) {
      const current = await getAvailability();
      await sendTelegramMessage(
        current.hasFreeSpots
          ? `Trenutno slobodno: ${current.freeSpots} mesta.`
          : "Trenutno nema slobodnih mesta."
      );
    } else {
      const n = Number(arg);
      if (Number.isInteger(n) && n >= 0) {
        const updated = await setAvailability(n);
        await sendTelegramMessage(
          updated.hasFreeSpots
            ? `Ažurirano. Slobodno: ${updated.freeSpots} mesta.`
            : "Ažurirano. Nema slobodnih mesta."
        );
      } else {
        await sendTelegramMessage("Nevalidan broj. Primer: /dostupnost 3");
      }
    }
  } else if (command === "/start" || command === "/pomoc") {
    await sendTelegramMessage(HELP_TEXT);
  }

  return NextResponse.json({ ok: true });
}
