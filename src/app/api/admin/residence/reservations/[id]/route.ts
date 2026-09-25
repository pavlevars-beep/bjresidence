import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateReservationStatus } from "@/lib/residence/reservations-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { status?: "cancelled" } | null;
  if (body?.status !== "cancelled") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const updated = await updateReservationStatus(params.id, "cancelled");
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("reservation_cancelled", `Rezervacija za ${updated.residentName} otkazana`, "reservation", updated.id);

  return NextResponse.json({ ok: true, reservation: updated });
}
