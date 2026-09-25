import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getResident, updateResident } from "@/lib/residence/residents-store";
import { getStaysForResident } from "@/lib/residence/stays-store";
import { getPaymentsForResident, getDepositHeld } from "@/lib/residence/payments-store";
import { getDocumentsForResident } from "@/lib/residence/documents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { Resident } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const resident = await getResident(params.id);
  if (!resident) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const [stays, payments, documents, cabins, depositHeld] = await Promise.all([
    getStaysForResident(resident.id),
    getPaymentsForResident(resident.id),
    getDocumentsForResident(resident.id),
    getCabins(),
    getDepositHeld(resident.id),
  ]);

  return NextResponse.json({ ok: true, resident, stays, payments, documents, cabins, depositHeld });
}

type ResidentPatch = Partial<Omit<Resident, "id" | "createdAt" | "updatedAt">>;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const patch = (await request.json().catch(() => null)) as ResidentPatch | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const updated = await updateResident(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("resident_updated", `Podaci gosta ${updated.firstName} ${updated.lastName} izmenjeni`, "resident", updated.id);

  return NextResponse.json({ ok: true, resident: updated });
}
