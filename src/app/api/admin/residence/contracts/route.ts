import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { generateContract } from "@/lib/residence/contract-engine";
import { getContracts, getContractsForResident } from "@/lib/residence/contracts-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const residentId = new URL(request.url).searchParams.get("residentId");
  const contracts = residentId ? await getContractsForResident(residentId) : await getContracts();
  return NextResponse.json({ ok: true, contracts });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { residentId?: string; stayId?: string; templateId?: string; overrideMissing?: boolean }
    | null;
  if (!body?.residentId || !body.stayId || !body.templateId) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const result = await generateContract({
    residentId: body.residentId,
    stayId: body.stayId,
    templateId: body.templateId,
    overrideMissing: body.overrideMissing,
  });

  if (!result.ok) {
    const status = result.error === "missing_required" ? 422 : 404;
    return NextResponse.json({ ok: false, error: result.error, missing: result.missing }, { status });
  }

  return NextResponse.json({ ok: true, contract: result.contract });
}
