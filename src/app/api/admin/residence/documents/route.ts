import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createDocumentRecord, getDocuments } from "@/lib/residence/documents-store";
import { getResidents } from "@/lib/residence/residents-store";
import { isAllowedDocumentType, saveResidentDocument, MAX_UPLOAD_BYTES } from "@/lib/residence-uploads";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { DocumentType } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const [documents, residents] = await Promise.all([getDocuments(), getResidents()]);
  const residentById = new Map(residents.map((r) => [r.id, r]));
  const enriched = documents.map((d) => {
    const resident = residentById.get(d.residentId);
    return { ...d, residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Nepoznat gost" };
  });
  return NextResponse.json({ ok: true, documents: enriched });
}

const MAX_IMAGES = 4;

/**
 * Called at "CONFIRM AND SAVE" time. If retain=false (the default), no image
 * is written to storage at all — only a metadata record of what was
 * confirmed, for audit. Never logs the extracted fields' values.
 *
 * A document can span more than one image (e.g. a residence permit's front
 * and back) — pass each under repeated "images" entries. When retained,
 * one ResidentDocument record is created per image, all sharing the same
 * extractedFieldsSnapshot, so each page stays individually viewable/deletable.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const residentId = String(formData.get("residentId") ?? "");
  const type = String(formData.get("type") ?? "passport") as DocumentType;
  const retain = formData.get("retain") === "true";
  const snapshotRaw = formData.get("extractedFieldsSnapshot");
  const images = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!residentId) {
    return NextResponse.json({ ok: false, error: "missing_resident" }, { status: 400 });
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  let extractedFieldsSnapshot: Record<string, string> | null = null;
  if (typeof snapshotRaw === "string" && snapshotRaw) {
    try {
      extractedFieldsSnapshot = JSON.parse(snapshotRaw);
    } catch {
      extractedFieldsSnapshot = null;
    }
  }

  if (retain) {
    if (images.length === 0) {
      return NextResponse.json({ ok: false, error: "missing_image" }, { status: 400 });
    }
    for (const image of images) {
      if (!isAllowedDocumentType(image.type)) {
        return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
      }
      if (image.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
      }
    }
  }

  const documents = retain
    ? await Promise.all(
        images.map(async (image) => {
          const blobPathname = await saveResidentDocument(image);
          return createDocumentRecord({
            residentId,
            type,
            blobPathname,
            originalFilename: image.name,
            contentType: image.type,
            retained: true,
            extractedFieldsSnapshot,
          });
        })
      )
    : [
        await createDocumentRecord({
          residentId,
          type,
          blobPathname: "",
          originalFilename: "",
          contentType: "",
          retained: false,
          extractedFieldsSnapshot,
        }),
      ];

  await logActivity(
    "document_uploaded",
    `Dokument (${type}) sačuvan${retain ? ` — ${documents.length} slika` : " (original nije zadržan)"}`,
    "resident",
    residentId
  );

  return NextResponse.json({ ok: true, document: documents[0], documents });
}
