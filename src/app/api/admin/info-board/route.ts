import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getInfoBoardConfig, setInfoBoardConfig } from "@/lib/info-board-store";
import { mergeInfoBoardConfig, type InfoBoardConfig } from "@/lib/info-board";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const config = await getInfoBoardConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<InfoBoardConfig> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const current = await getInfoBoardConfig();
  const merged = mergeInfoBoardConfig(current, body);
  const saved = await setInfoBoardConfig(merged);
  return NextResponse.json({ ok: true, config: saved });
}
