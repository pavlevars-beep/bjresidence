import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContract, updateContractStatus } from "@/lib/residence/contracts-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { ContractStatus } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const contract = await getContract(params.id);
  if (!contract) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, contract });
}

const ALLOWED_MANUAL_STATUSES: ContractStatus[] = ["signed", "cancelled"];

/** Manual status change without a file — e.g. "Mark as signed" when the paper copy is filed elsewhere. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { status?: string; notes?: string } | null;
  if (!body?.status || !ALLOWED_MANUAL_STATUSES.includes(body.status as ContractStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  const status = body.status as ContractStatus;
  const patch = status === "signed" ? { signedAt: new Date().toISOString(), notes: body.notes } : { notes: body.notes };
  const updated = await updateContractStatus(params.id, status, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity(
    status === "signed" ? "contract_marked_signed" : "contract_cancelled",
    status === "signed" ? "Ugovor ručno označen kao potpisan" : "Ugovor otkazan",
    "contract",
    params.id
  );

  return NextResponse.json({ ok: true, contract: updated });
}
