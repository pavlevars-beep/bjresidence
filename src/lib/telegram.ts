import { formatDateDisplay } from "./residence/date-math";

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

export function formatCompanyInquiry(payload: {
  employeeCount?: unknown;
  arrivalDate?: unknown;
  duration?: unknown;
  email?: unknown;
}) {
  const line = (label: string, value: unknown) =>
    value ? `${label}: ${escapeHtml(String(value))}` : null;

  return [
    "<b>Novi B2B upit — smeštaj za zaposlene (blog)</b>",
    line("Broj zaposlenih", payload.employeeCount),
    line("Očekivani datum dolaska", payload.arrivalDate),
    line("Očekivano trajanje boravka", payload.duration),
    line("Kontakt email", payload.email),
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
    `Plaćeni period ističe: ${escapeHtml(formatDateDisplay(payload.currentPeriodEnd))}`,
    `Sledeća rata dospeva: ${escapeHtml(formatDateDisplay(payload.nextPaymentDue))}`,
    `Preostalo dana: ${payload.daysRemaining}`,
    "",
    `Status: ${escapeHtml(payload.continuationStatus)}`,
    "",
    `Otvori admin: ${escapeHtml(payload.adminUrl)}`,
    ...(payload.kind === "move_out" ? [] : ["", "Poruka za gosta stiže odmah ispod — prosledi je ili kopiraj."]),
  ].join("\n");
}

function guestFirstName(firstName: string): string {
  // Names are often stored in passport capitals ("STEFAN MICHAEL") — greet with just "Stefan".
  const first = firstName.trim().split(/\s+/)[0] ?? "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function guestDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

/**
 * Ready-to-forward English message for the guest, sent as its own Telegram
 * message right after the owner's reminder so it can be forwarded or copied
 * as-is. `paidUntil` is the last paid day: the period expires the day after,
 * and the next month's rent is due by `paidUntil`.
 */
export function formatGuestPaymentMessage(payload: {
  firstName: string;
  paidUntil: string;
  daysRemaining: number;
  monthlyRent: number;
  currency: string;
  askToConfirmStaying: boolean;
}) {
  const expires = new Date(`${payload.paidUntil}T00:00:00Z`);
  expires.setUTCDate(expires.getUTCDate() + 1);
  const expiresOn = guestDate(expires.toISOString().slice(0, 10));
  const payBy = guestDate(payload.paidUntil);
  const rent = `${payload.monthlyRent} ${payload.currency}`;

  const when =
    payload.daysRemaining < 0
      ? `ended on ${expiresOn}`
      : payload.daysRemaining === 0
        ? `ends today (it expires on ${expiresOn})`
        : payload.daysRemaining === 1
          ? `ends tomorrow (it expires on ${expiresOn})`
          : `ends in ${payload.daysRemaining} days (it expires on ${expiresOn})`;

  const lines = [
    `Hi ${escapeHtml(guestFirstName(payload.firstName))},`,
    "",
    `Your paid period at BJ Residence ${when}.`,
    payload.daysRemaining < 0
      ? `Please pay the rent for the next month (${escapeHtml(rent)}) as soon as possible.`
      : `${payload.askToConfirmStaying ? "If you'd like to stay for another month, please" : "Please"} pay the rent (${escapeHtml(rent)}) by ${payBy}.`,
  ];
  if (payload.askToConfirmStaying) lines.push("If you're planning to move out, please let me know.");
  lines.push("", "Thank you!");
  return lines.join("\n");
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
