import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getInfoPointConfig, setInfoPointConfig } from "@/lib/info-point-store";
import { mergeInfoPointConfig, type InfoPointConfig } from "@/lib/info-point";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const config = await getInfoPointConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<InfoPointConfig> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const current = await getInfoPointConfig();
  const merged = mergeInfoPointConfig(current, body);
  const saved = await setInfoPointConfig(merged);
  return NextResponse.json({ ok: true, config: saved });
}
