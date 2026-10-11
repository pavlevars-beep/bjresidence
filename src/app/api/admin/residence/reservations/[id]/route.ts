import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteReservation, updateReservation, updateReservationStatus, type ReservationPatch } from "@/lib/residence/reservations-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

/**
 * {status: "cancelled"} cancels the reservation (unchanged behavior).
 * Any other body is treated as a plain field edit (cabin, dates, price, notes...).
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ({ status: "cancelled" } | ReservationPatch) | null;
  if (!body) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  if ("status" in body && body.status === "cancelled") {
    const updated = await updateReservationStatus(params.id, "cancelled");
    if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    await logActivity("reservation_cancelled", `Rezervacija za ${updated.residentName} otkazana`, "reservation", updated.id);
    return NextResponse.json({ ok: true, reservation: updated });
  }

  const updated = await updateReservation(params.id, body as ReservationPatch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  await logActivity("reservation_updated", `Rezervacija za ${updated.residentName} izmenjena`, "reservation", updated.id);
  return NextResponse.json({ ok: true, reservation: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const deleted = await deleteReservation(params.id);
  if (!deleted) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("reservation_deleted", "Rezervacija obrisana", "reservation", params.id);

  return NextResponse.json({ ok: true });
}
