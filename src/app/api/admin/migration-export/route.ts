import { NextResponse } from "next/server";
import { get, list } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Temporary, for the one-off Vercel Blob -> Cloudflare R2 copy. Delete after cutover.
export async function GET(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, error: "no_blob_store" }, { status: 400 });
  }

  const pathname = new URL(request.url).searchParams.get("pathname");

  if (!pathname) {
    const blobs: { pathname: string; size: number; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ cursor, limit: 1000 });
      blobs.push(...page.blobs.map((b) => ({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return NextResponse.json({ ok: true, blobs });
  }

  const result = await get(pathname, { access: "private", useCache: false });
  if (!result?.stream) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
