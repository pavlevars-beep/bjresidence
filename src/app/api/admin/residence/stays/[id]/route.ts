import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteStay, getStay, updateStay, type StayPatch } from "@/lib/residence/stays-store";
import { deletePaymentsForStay } from "@/lib/residence/payments-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const patch = (await request.json().catch(() => null)) as StayPatch | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const updated = await updateStay(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("stay_updated", "Boravak izmenjen (ispravka)", "stay", params.id);

  return NextResponse.json({ ok: true, stay: updated });
}

/** Also removes every payment tied to this stay — an orphaned payment pointing at a deleted stay is just confusing clutter, not a useful record. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const stay = await getStay(params.id);
  if (!stay) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await deletePaymentsForStay(params.id);
  await deleteStay(params.id);

  await logActivity("stay_deleted", "Boravak obrisan (ispravka)", "resident", stay.residentId);

  return NextResponse.json({ ok: true });
}
