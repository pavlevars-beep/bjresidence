import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { moveCabin } from "@/lib/residence/stays-store";
import { getCabin } from "@/lib/residence/cabins-store";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { newCabinId?: string; moveDate?: string } | null;
  if (!body?.newCabinId || !body.moveDate) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const result = await moveCabin(params.id, body.newCabinId, body.moveDate);
  if (!result) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const newCabin = await getCabin(body.newCabinId);
  await logActivity(
    "stay_moved_cabin",
    `Gost premešten u kabinu ${newCabin?.name ?? body.newCabinId} od ${body.moveDate}`,
    "stay",
    result.newStay.id
  );

  return NextResponse.json({ ok: true, endedStay: result.endedStay, newStay: result.newStay });
}
