import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCabin, updateCabin } from "@/lib/residence/cabins-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { Cabin } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const cabin = await getCabin(params.id);
  if (!cabin) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, cabin });
}

type CabinPatch = Partial<Pick<Cabin, "name" | "maintenanceFlag" | "maintenanceNote" | "monthlyRentDefault" | "currency" | "notes">>;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const patch = (await request.json().catch(() => null)) as CabinPatch | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const updated = await updateCabin(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await logActivity(
    "cabin_updated",
    `Kabina ${updated.name} ažurirana${patch.maintenanceFlag !== undefined ? (patch.maintenanceFlag ? " (na održavanju)" : " (održavanje završeno)") : ""}`,
    "cabin",
    updated.id
  );

  return NextResponse.json({ ok: true, cabin: updated });
}
