import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getResident, updateResident, deleteResident } from "@/lib/residence/residents-store";
import { getStaysForResident, deleteStaysForResident } from "@/lib/residence/stays-store";
import { getPaymentsForResident, getDepositHeld, deletePaymentsForResident } from "@/lib/residence/payments-store";
import { getDocumentsForResident, deleteDocumentRecord } from "@/lib/residence/documents-store";
import { getContractsForResident, deleteContract } from "@/lib/residence/contracts-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { deleteResidentDocument } from "@/lib/residence-uploads";
import { deleteContractFile } from "@/lib/contract-uploads";
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

/**
 * Full cascade delete — a mistakenly-entered resident along with every
 * stay/payment/document/contract tied to them (and the underlying document
 * and contract files). Reservations that reference this resident are left
 * alone; they already stand as their own independent record.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resident = await getResident(params.id);
  if (!resident) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const [documents, contracts] = await Promise.all([
    getDocumentsForResident(params.id),
    getContractsForResident(params.id),
  ]);

  for (const doc of documents) {
    if (doc.blobPathname) await deleteResidentDocument(doc.blobPathname);
    await deleteDocumentRecord(doc.id);
  }

  for (const contract of contracts) {
    if (contract.docxBlobPathname) await deleteContractFile(contract.docxBlobPathname);
    if (contract.signedBlobPathname) await deleteContractFile(contract.signedBlobPathname);
    await deleteContract(contract.id);
  }

  await deletePaymentsForResident(params.id);
  await deleteStaysForResident(params.id);
  await deleteResident(params.id);

  await logActivity("resident_deleted", `Gost ${resident.firstName} ${resident.lastName} obrisan (sa svim povezanim podacima)`, "resident", params.id);

  return NextResponse.json({ ok: true });
}
