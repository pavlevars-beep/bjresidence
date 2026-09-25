import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { convertReservation } from "@/lib/residence/reservations-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { NewResidentInput } from "@/lib/residence/residents-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { resident?: NewResidentInput } | null;

  try {
    const result = await convertReservation(params.id, body?.resident);
    if (!result) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    await logActivity(
      "reservation_converted",
      `Rezervacija za ${result.reservation.residentName} pretvorena u aktivni boravak`,
      "reservation",
      result.reservation.id
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "resident_input_required") {
      return NextResponse.json({ ok: false, error: "resident_input_required" }, { status: 400 });
    }
    throw err;
  }
}
