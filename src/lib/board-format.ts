/**
 * Date/time formatting for the /info kiosk board. Always resolves against the
 * Europe/Belgrade timezone explicitly via Intl's `timeZone` option, so the
 * display stays correct even if the tablet's own OS timezone is misconfigured.
 */
const TZ = "Europe/Belgrade";

function capitalize(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** "utorak, 18. avgust" / "Tuesday, 18 August" for a real Date instant. */
export function formatBoardDate(date: Date, locale: "sr" | "en"): string {
  if (locale === "sr") {
    return capitalize(
      new Intl.DateTimeFormat("sr-Latn-RS", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(
        date
      )
    );
  }
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: TZ }).format(date);
  const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: TZ }).format(date);
  return `${weekday}, ${dayMonth}`;
}

/** "07:28" — 24h time for a real Date instant. */
export function formatBoardTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(
    date
  );
}

/** Parses an admin-entered "YYYY-MM-DD" as noon UTC so the calendar day never shifts across timezones. */
function parseBoardDateString(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

/** "Četvrtak, 20. avgust" / "Thursday, 20 August" for an admin-entered YYYY-MM-DD string. */
export function formatFullDate(dateStr: string, locale: "sr" | "en"): string {
  return formatBoardDate(parseBoardDateString(dateStr), locale);
}

/** "20. avg" / "20 Aug" — compact form for list rows. */
export function formatShortDate(dateStr: string, locale: "sr" | "en"): string {
  const d = parseBoardDateString(dateStr);
  return locale === "sr"
    ? new Intl.DateTimeFormat("sr-Latn-RS", { day: "numeric", month: "short", timeZone: TZ }).format(d)
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(d);
}

/** Current hour in Belgrade time, for the time-of-day greeting. */
export function getBelgradeHour(date: Date): number {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ }).format(date));
}

/** "YYYY-MM-DD" for the current calendar day in Belgrade time — comparable directly against admin-entered date strings. */
export function getBelgradeDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    date
  );
}
