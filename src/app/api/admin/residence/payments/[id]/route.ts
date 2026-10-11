import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deletePayment, updatePayment, type PaymentPatch } from "@/lib/residence/payments-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const patch = (await request.json().catch(() => null)) as PaymentPatch | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const updated = await updatePayment(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("payment_updated", "Uplata izmenjena (ispravka)", "payment", params.id);

  return NextResponse.json({ ok: true, payment: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const deleted = await deletePayment(params.id);
  if (!deleted) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("payment_deleted", "Uplata obrisana (ispravka)", "payment", params.id);

  return NextResponse.json({ ok: true });
}
