import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDocument } from "@/lib/residence/documents-store";
import { readResidentDocument } from "@/lib/residence-uploads";

export const dynamic = "force-dynamic";

/**
 * Streams a retained passport/document image. Every read re-checks the admin
 * cookie right here — private Vercel Blob already requires our server token
 * to fetch at all, so this authenticated proxy is the practical equivalent
 * of a short-lived signed URL without ever exposing a bare fetchable link.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const doc = await getDocument(params.id);
  if (!doc || !doc.retained || !doc.blobPathname) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const file = await readResidentDocument(doc.blobPathname);
  if (!file) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
