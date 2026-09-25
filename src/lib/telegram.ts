const TELEGRAM_API = "https://api.telegram.org";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // eslint-disable-next-line no-console
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set, skipping message.");
    return;
  }

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error("[telegram] sendMessage failed:", await res.text());
  }
}

export function formatBookingInquiry(payload: {
  moveInDate?: unknown;
  duration?: unknown;
  guests?: unknown;
  firstName?: unknown;
  phone?: unknown;
  email?: unknown;
  note?: unknown;
}) {
  const line = (label: string, value: unknown) =>
    value ? `${label}: ${escapeHtml(String(value))}` : null;

  return [
    "<b>Novi upit za dostupnost</b>",
    line("Ime i prezime", payload.firstName),
    line("Telefon", payload.phone),
    line("Email", payload.email),
    line("Datum useljenja", payload.moveInDate),
    line("Trajanje", payload.duration),
    line("Broj osoba", payload.guests),
    line("Napomena", payload.note),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Stay-cycle reminder — deliberately excludes passport/identification data,
 * only names/dates/status needed to act on it. See residence/reminders.ts.
 */
export function formatStayReminder(payload: {
  cabinName: string;
  residentName: string;
  currentPeriodEnd: string;
  nextPaymentDue: string;
  daysRemaining: number;
  continuationStatus: string;
  adminUrl: string;
  kind: "payment_due" | "move_out" | "decision_needed";
}) {
  const title =
    payload.kind === "move_out"
      ? "BJ Residence — očekivano iseljenje"
      : "BJ Residence — odluka o nastavku boravka";

  return [
    `<b>${title}</b>`,
    "",
    `${escapeHtml(payload.cabinName)} — ${escapeHtml(payload.residentName)}`,
    "",
    `Plaćeni period ističe: ${escapeHtml(payload.currentPeriodEnd)}`,
    `Sledeća rata dospeva: ${escapeHtml(payload.nextPaymentDue)}`,
    `Preostalo dana: ${payload.daysRemaining}`,
    "",
    `Status: ${escapeHtml(payload.continuationStatus)}`,
    "",
    `Otvori admin: ${escapeHtml(payload.adminUrl)}`,
  ].join("\n");
}

export function formatIssueReport(payload: {
  category?: unknown;
  location?: unknown;
  description?: unknown;
  residentName?: unknown;
  hasPhoto?: unknown;
}) {
  const line = (label: string, value: unknown) =>
    value ? `${label}: ${escapeHtml(String(value))}` : null;

  return [
    "<b>Nova prijava kvara — Info Point</b>",
    line("Kategorija", payload.category),
    line("Lokacija", payload.location),
    line("Opis", payload.description),
    line("Ime/soba", payload.residentName),
    payload.hasPhoto ? "Fotografija: da (pogledajte u admin panelu)" : null,
  ]
    .filter(Boolean)
    .join("\n");
}
