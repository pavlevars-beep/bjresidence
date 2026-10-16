import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createStay } from "@/lib/residence/stays-store";
import { getResident, updateResident } from "@/lib/residence/residents-store";
import { getCabin } from "@/lib/residence/cabins-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

interface NewStayBody {
  residentId?: string;
  cabinId?: string;
  moveInDate?: string;
  estimatedDurationLabel?: string;
  expectedMoveOutDate?: string | null;
  monthlyRent?: number;
  currency?: string;
}

/**
 * Starts a brand-new Stay for an existing resident who doesn't have an
 * active one yet — a "planned" guest finally moving in, or a moved-out
 * resident returning. Distinct from stays-store's moveCabin() (which ends an
 * existing active Stay first): there's nothing to end here.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as NewStayBody | null;
  if (!body?.residentId || !body.cabinId || !body.moveInDate || !body.monthlyRent) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const resident = await getResident(body.residentId);
  if (!resident) {
    return NextResponse.json({ ok: false, error: "resident_not_found" }, { status: 404 });
  }

  const stay = await createStay({
    residentId: body.residentId,
    cabinId: body.cabinId,
    moveInDate: body.moveInDate,
    estimatedDurationLabel: body.estimatedDurationLabel ?? "",
    expectedMoveOutDate: body.expectedMoveOutDate ?? null,
    monthlyRent: body.monthlyRent,
    currency: body.currency ?? "€",
    status: "active",
  });

  const updatedResident = resident.status === "active" ? resident : await updateResident(resident.id, { status: "active" });

  const cabin = await getCabin(body.cabinId);
  await logActivity(
    "stay_started",
    `${resident.firstName} ${resident.lastName} useljen u kabinu ${cabin?.name ?? body.cabinId}`,
    "stay",
    stay.id
  );

  return NextResponse.json({ ok: true, stay, resident: updatedResident ?? resident });
}
