import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContract } from "@/lib/residence/contracts-store";
import { getResident } from "@/lib/residence/residents-store";
import { getCabin } from "@/lib/residence/cabins-store";
import { buildContractFilename } from "@/lib/residence/contract-engine";
import { readContractFile } from "@/lib/contract-uploads";

export const dynamic = "force-dynamic";

/**
 * Streams the generated DOCX (default) or the signed scan (?type=signed).
 * Every request re-checks the admin cookie — the blob itself is private and
 * never reachable by a bare URL, so this is the equivalent of a short-lived
 * signed URL without ever exposing one.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const contract = await getContract(params.id);
  if (!contract) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const wantSigned = new URL(request.url).searchParams.get("type") === "signed";
  const pathname = wantSigned ? contract.signedBlobPathname : contract.docxBlobPathname;
  if (!pathname) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const file = await readContractFile(pathname);
  if (!file) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  let filename = `potpisan-ugovor-${contract.id.slice(0, 8)}`;
  if (!wantSigned) {
    const [resident, cabin] = await Promise.all([getResident(contract.residentId), getCabin(contract.cabinId)]);
    filename = resident && cabin ? buildContractFilename(resident, cabin, contract.generatedAt.slice(0, 10)) : `ugovor-${contract.id.slice(0, 8)}.docx`;
  } else {
    const ext = file.contentType === "application/pdf" ? "pdf" : file.contentType === "image/png" ? "png" : "jpg";
    filename = `${filename}.${ext}`;
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
