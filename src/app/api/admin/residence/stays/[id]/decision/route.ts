import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setContinuationStatus } from "@/lib/residence/stays-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { ContinuationStatus } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

const VALID: ContinuationStatus[] = ["undecided", "continuing", "moving_out"];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { status?: string; expectedMoveOutDate?: string } | null;
  if (!body?.status || !VALID.includes(body.status as ContinuationStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  const updated = await setContinuationStatus(params.id, body.status as ContinuationStatus, body.expectedMoveOutDate);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity("stay_decision_set", `Odluka o nastavku boravka: ${body.status}`, "stay", updated.id);

  return NextResponse.json({ ok: true, stay: updated });
}
