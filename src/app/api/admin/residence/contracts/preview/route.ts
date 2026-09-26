import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadContractContext } from "@/lib/residence/contract-engine";

export const dynamic = "force-dynamic";

/** Values-only preview — never touches the DOCX file, just shows what would be filled in. */
export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { residentId?: string; stayId?: string } | null;
  if (!body?.residentId || !body.stayId) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const ctx = await loadContractContext(body.residentId, body.stayId);
  if (!ctx) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, variables: ctx.variables, missing: ctx.missing });
}
