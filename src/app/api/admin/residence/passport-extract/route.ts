import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAllowedDocumentType, MAX_UPLOAD_BYTES } from "@/lib/residence-uploads";
import { extractPassportFields, isPassportOcrConfigured } from "@/lib/passport-ocr";

export const dynamic = "force-dynamic";

/**
 * Extraction only — persists nothing. The admin reviews and corrects every
 * field in the browser; nothing becomes part of a Resident record until a
 * separate "CONFIRM AND SAVE" call to the residents API.
 */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isPassportOcrConfigured()) {
    return NextResponse.json({ ok: false, error: "ocr_not_configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_image" }, { status: 400 });
  }
  if (image.name.toLowerCase().match(/\.heic$|\.heif$/) || image.type === "image/heic" || image.type === "image/heif") {
    return NextResponse.json({ ok: false, error: "unsupported_heic" }, { status: 400 });
  }
  if (!isAllowedDocumentType(image.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
  }
  if (image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const base64 = buffer.toString("base64");

  try {
    const fields = await extractPassportFields(base64, image.type);
    return NextResponse.json({ ok: true, fields });
  } catch (err) {
    console.error("[passport-extract]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ ok: false, error: "extraction_failed" }, { status: 502 });
  }
}
