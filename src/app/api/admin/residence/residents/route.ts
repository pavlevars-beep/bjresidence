import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createResident, getResidents, type NewResidentInput } from "@/lib/residence/residents-store";
import { createStay } from "@/lib/residence/stays-store";
import { createPayment, type NewPaymentInput } from "@/lib/residence/payments-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const residents = await getResidents();
  return NextResponse.json({ ok: true, residents });
}

interface CreateResidentBody {
  resident: NewResidentInput;
  stay?: {
    cabinId: string;
    moveInDate: string;
    estimatedDurationLabel?: string;
    expectedMoveOutDate?: string | null;
    monthlyRent: number;
    currency?: string;
  } | null;
  payments?: Omit<NewPaymentInput, "residentId" | "cabinId" | "stayId">[];
}

/**
 * Composite create: a resident, optionally their first Stay, optionally the
 * initial rent/deposit payments — one call, fixed write order (resident ->
 * stay -> payments -> activity log last), matching the spec's single-screen
 * "Add resident" flow instead of forcing several round trips.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreateResidentBody | null;
  if (!body?.resident?.firstName || !body.resident.lastName) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const resident = await createResident(body.resident);

  let stay = null;
  const payments = [];
  if (body.stay) {
    stay = await createStay({
      residentId: resident.id,
      cabinId: body.stay.cabinId,
      moveInDate: body.stay.moveInDate,
      estimatedDurationLabel: body.stay.estimatedDurationLabel,
      expectedMoveOutDate: body.stay.expectedMoveOutDate,
      monthlyRent: body.stay.monthlyRent,
      currency: body.stay.currency,
      status: "active",
    });

    for (const p of body.payments ?? []) {
      const payment = await createPayment({
        ...p,
        residentId: resident.id,
        cabinId: stay.cabinId,
        stayId: stay.id,
      });
      payments.push(payment);
    }
  }

  await logActivity(
    "resident_created",
    `Dodat gost ${resident.firstName} ${resident.lastName}${stay ? ` — kabina dodeljena` : ""}`,
    "resident",
    resident.id
  );

  return NextResponse.json({ ok: true, resident, stay, payments });
}
