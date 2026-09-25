import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { endStay } from "@/lib/residence/stays-store";
import { updateResident } from "@/lib/residence/residents-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { actualMoveOutDate?: string } | null;
  if (!body?.actualMoveOutDate) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const updated = await endStay(params.id, body.actualMoveOutDate);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await updateResident(updated.residentId, { status: "moved_out" });

  await logActivity("stay_ended", `Boravak završen ${body.actualMoveOutDate}, kabina oslobođena`, "stay", updated.id);

  return NextResponse.json({ ok: true, stay: updated });
}
