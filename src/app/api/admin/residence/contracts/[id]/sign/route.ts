import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContract, updateContractStatus } from "@/lib/residence/contracts-store";
import { isSignedFileType, saveSignedContract, MAX_SIGNED_BYTES } from "@/lib/contract-uploads";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

/** Uploads a scan/photo of the physically-signed contract and marks it Signed. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const contract = await getContract(params.id);
  if (!contract) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }
  if (!isSignedFileType(file.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
  }
  if (file.size > MAX_SIGNED_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }

  const signedBlobPathname = await saveSignedContract(file);
  const updated = await updateContractStatus(params.id, "signed", {
    signedBlobPathname,
    signedAt: new Date().toISOString(),
  });

  await logActivity("contract_signed", "Potpisana kopija ugovora otpremljena", "contract", params.id);

  return NextResponse.json({ ok: true, contract: updated });
}
