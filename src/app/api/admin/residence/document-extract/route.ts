import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAllowedDocumentType, MAX_UPLOAD_BYTES } from "@/lib/residence-uploads";
import { extractDocumentFields, isDocumentOcrConfigured, type DocumentImageInput } from "@/lib/document-ocr";

export const dynamic = "force-dynamic";

const MAX_IMAGES = 4;

/**
 * Extraction only — persists nothing. The admin reviews and corrects every
 * field in the browser; nothing becomes part of a Resident record until a
 * separate "CONFIRM AND SAVE" call to the residents/documents API.
 *
 * Accepts 1–4 images of the same document (e.g. front + back of a residence
 * permit) under the "images" field and extracts from all of them together.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isDocumentOcrConfigured()) {
    return NextResponse.json({ ok: false, error: "ocr_not_configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_image" }, { status: 400 });
  }
  if (files.length > MAX_IMAGES) {
    return NextResponse.json({ ok: false, error: "too_many_images" }, { status: 400 });
  }

  for (const file of files) {
    if (file.name.toLowerCase().match(/\.heic$|\.heif$/) || file.type === "image/heic" || file.type === "image/heif") {
      return NextResponse.json({ ok: false, error: "unsupported_heic" }, { status: 400 });
    }
    if (!isAllowedDocumentType(file.type)) {
      return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
    }
  }

  try {
    const images: DocumentImageInput[] = await Promise.all(
      files.map(async (file) => ({
        base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        mediaType: file.type,
      }))
    );
    const fields = await extractDocumentFields(images);
    return NextResponse.json({ ok: true, fields });
  } catch (err) {
    console.error("[document-extract]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ ok: false, error: "extraction_failed" }, { status: 502 });
  }
}
