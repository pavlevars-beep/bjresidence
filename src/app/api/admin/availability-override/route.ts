import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAvailability, setAvailabilityOverride } from "@/lib/availability-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const availability = await getAvailability();
  return NextResponse.json({ ok: true, availability });
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { overrideEnabled?: boolean; freeSpots?: number } | null;
  if (!body || typeof body.overrideEnabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const availability = await setAvailabilityOverride(body.overrideEnabled, body.freeSpots);
  return NextResponse.json({ ok: true, availability });
}
