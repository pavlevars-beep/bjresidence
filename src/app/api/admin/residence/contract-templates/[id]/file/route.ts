import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContractTemplate } from "@/lib/residence/contract-templates-store";
import { readContractFile } from "@/lib/contract-uploads";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const template = await getContractTemplate(params.id);
  if (!template) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const file = await readContractFile(template.blobPathname);
  if (!file) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${template.name.replace(/[^a-z0-9-_]+/gi, "-")}-v${template.version}.docx"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
