import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSafeUploadFilename, readIssuePhoto } from "@/lib/info-point-uploads";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Serves resident-submitted issue photos. Admin-only: these photos may show
 * the inside of a resident's room, so they're not public like the rest of
 * Info Point's content — only served to an authenticated admin session.
 */
export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSafeUploadFilename(params.filename)) {
    return NextResponse.json({ ok: false, error: "invalid_filename" }, { status: 400 });
  }

  const buffer = await readIssuePhoto(params.filename);
  if (!buffer) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const ext = params.filename.split(".").pop() ?? "";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
