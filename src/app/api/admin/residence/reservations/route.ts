import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createReservation, getReservations, type NewReservationInput } from "@/lib/residence/reservations-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const reservations = await getReservations();
  return NextResponse.json({ ok: true, reservations });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as NewReservationInput | null;
  if (!body?.cabinId || !body.residentName || !body.startDate) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const reservation = await createReservation(body);
  await logActivity("reservation_created", `Rezervacija za ${reservation.residentName} od ${reservation.startDate}`, "reservation", reservation.id);

  return NextResponse.json({ ok: true, reservation });
}
