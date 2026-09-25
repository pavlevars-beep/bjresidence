/**
 * Calendar-month arithmetic for the rent cycle, isolated here because naive
 * `Date` math overflows month boundaries (e.g. Jan 31 + 1 month rolls to
 * Mar 3, not Feb 28) — a classic bug if left inline.
 */

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Adds one calendar month to an ISO date, clamping to the last valid day of
 * the target month instead of overflowing (Jan 31 -> Feb 28/29, not Mar 3).
 */
export function addCalendarMonthClamped(iso: string): string {
  const date = parseISODate(iso);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonth = month + 1;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const clampedDay = Math.min(day, daysInMonth(targetYear, normalizedMonth));

  return toISODate(new Date(Date.UTC(targetYear, normalizedMonth, clampedDay)));
}

/** One day before the given ISO date — used to express an inclusive period end. */
export function subtractOneDay(iso: string): string {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() - 1);
  return toISODate(date);
}

/**
 * The current paid-through rent period, anchored to the day-of-month of
 * moveInDate (a move-in on the 15th runs 15th-to-14th, not calendar-month).
 * If a later rent payment's periodTo is provided, the period continues from
 * the day after that instead of restarting from moveInDate.
 */
export function computeCurrentPeriod(
  moveInDate: string,
  latestRentPeriodTo?: string | null
): { currentPeriodStart: string; currentPeriodEnd: string } {
  if (latestRentPeriodTo) {
    const start = addOneDay(latestRentPeriodTo);
    return { currentPeriodStart: start, currentPeriodEnd: subtractOneDay(addCalendarMonthClamped(start)) };
  }
  return {
    currentPeriodStart: moveInDate,
    currentPeriodEnd: subtractOneDay(addCalendarMonthClamped(moveInDate)),
  };
}

function addOneDay(iso: string): string {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + 1);
  return toISODate(date);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** "current" if the period end is more than 7 days away, "due_soon" within 7 days, "overdue" if past. */
export function computePaymentStatus(currentPeriodEnd: string): "current" | "due_soon" | "overdue" {
  const days = daysBetween(todayISO(), currentPeriodEnd);
  if (days < 0) return "overdue";
  if (days <= 7) return "due_soon";
  return "current";
}
