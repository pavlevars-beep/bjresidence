import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteDocumentRecord } from "@/lib/residence/documents-store";
import { deleteResidentDocument } from "@/lib/residence-uploads";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

/** Removes the document (metadata + underlying blob if any) — never touches the resident/stay/payment records. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const deleted = await deleteDocumentRecord(params.id);
  if (!deleted) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  if (deleted.blobPathname) {
    await deleteResidentDocument(deleted.blobPathname);
  }

  await logActivity("document_deleted", "Dokument obrisan", "resident", deleted.residentId);

  return NextResponse.json({ ok: true });
}
