import { getCabins } from "./cabins-store";
import { getResidents } from "./residents-store";
import { getStays } from "./stays-store";
import { getReservations } from "./reservations-store";
import { getDepositHeld } from "./payments-store";
import { computePaymentStatus, daysBetween, todayISO } from "./date-math";
import type { Cabin, CabinLiveStatus, PaymentStatus, Reservation, Resident, Stay } from "./types";

export interface CabinView {
  cabin: Cabin;
  liveStatus: CabinLiveStatus;
  activeStay: Stay | null;
  resident: Resident | null;
  paymentStatus: PaymentStatus | null;
  upcomingReservation: Reservation | null;
  /** Set when an active stay's resident has decided to move out — the future date this cabin frees up. */
  availableFrom: string | null;
}

function liveStatusFor(cabin: Cabin, activeStay: Stay | null, plannedStay: Stay | null, reservation: Reservation | null): CabinLiveStatus {
  if (cabin.maintenanceFlag) return "maintenance";
  if (activeStay) return "occupied";
  if (plannedStay || reservation) return "reserved";
  return "available";
}

/** The single source of truth for "what is this cabin's status right now" — never stored, always computed. */
export async function getCabinViews(): Promise<CabinView[]> {
  const [cabins, stays, reservations] = await Promise.all([getCabins(), getStays(), getReservations()]);
  const residents = await getResidents();
  const residentById = new Map(residents.map((r) => [r.id, r]));

  return cabins.map((cabin) => {
    const cabinStays = stays.filter((s) => s.cabinId === cabin.id);
    const activeStay = cabinStays.find((s) => s.status === "active") ?? null;
    const plannedStay = cabinStays.find((s) => s.status === "planned") ?? null;
    const reservation = reservations.find((r) => r.cabinId === cabin.id && r.status === "active") ?? null;

    const resident = activeStay ? residentById.get(activeStay.residentId) ?? null : null;
    const paymentStatus = activeStay ? computePaymentStatus(activeStay.currentPeriodEnd) : null;
    const availableFrom =
      activeStay && activeStay.continuationStatus === "moving_out" && activeStay.expectedMoveOutDate
        ? activeStay.expectedMoveOutDate
        : null;

    return {
      cabin,
      liveStatus: liveStatusFor(cabin, activeStay, plannedStay, reservation),
      activeStay,
      resident,
      paymentStatus,
      upcomingReservation: reservation,
      availableFrom,
    };
  });
}

export interface ResidenceStats {
  totalCabins: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  monthlyRecurringRent: number;
  depositsHeld: number;
  paymentsDueSoon: number;
}

export async function getResidenceStats(): Promise<ResidenceStats> {
  const views = await getCabinViews();
  const activeStays = views.map((v) => v.activeStay).filter((s): s is Stay => !!s);

  let depositsHeld = 0;
  for (const view of views) {
    if (view.resident) depositsHeld += await getDepositHeld(view.resident.id);
  }

  return {
    totalCabins: views.length,
    occupied: views.filter((v) => v.liveStatus === "occupied").length,
    available: views.filter((v) => v.liveStatus === "available").length,
    reserved: views.filter((v) => v.liveStatus === "reserved").length,
    maintenance: views.filter((v) => v.liveStatus === "maintenance").length,
    monthlyRecurringRent: activeStays.reduce((sum, s) => sum + s.monthlyRent, 0),
    depositsHeld,
    paymentsDueSoon: views.filter((v) => v.paymentStatus === "due_soon" || v.paymentStatus === "overdue").length,
  };
}

export interface UpcomingItem {
  kind: "payment_due" | "move_out" | "decision_needed";
  stay: Stay;
  cabin: Cabin;
  resident: Resident;
  date: string;
  daysRemaining: number;
}

/** Everything needing attention in the next N days: payment renewals, expected move-outs, decisions needed. */
export async function getUpcoming(withinDays = 7): Promise<UpcomingItem[]> {
  const [cabins, stays, residents] = await Promise.all([getCabins(), getStays(), getResidents()]);
  const cabinById = new Map(cabins.map((c) => [c.id, c]));
  const residentById = new Map(residents.map((r) => [r.id, r]));
  const today = todayISO();
  const items: UpcomingItem[] = [];

  for (const stay of stays) {
    if (stay.status !== "active") continue;
    const cabin = cabinById.get(stay.cabinId);
    const resident = residentById.get(stay.residentId);
    if (!cabin || !resident) continue;

    const daysToPeriodEnd = daysBetween(today, stay.currentPeriodEnd);
    if (daysToPeriodEnd <= withinDays) {
      items.push({
        kind: stay.continuationStatus === "undecided" ? "decision_needed" : "payment_due",
        stay,
        cabin,
        resident,
        date: stay.currentPeriodEnd,
        daysRemaining: daysToPeriodEnd,
      });
    }

    if (stay.continuationStatus === "moving_out" && stay.expectedMoveOutDate) {
      const daysToMoveOut = daysBetween(today, stay.expectedMoveOutDate);
      if (daysToMoveOut <= withinDays) {
        items.push({
          kind: "move_out",
          stay,
          cabin,
          resident,
          date: stay.expectedMoveOutDate,
          daysRemaining: daysToMoveOut,
        });
      }
    }
  }

  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
