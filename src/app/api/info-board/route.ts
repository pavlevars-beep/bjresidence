import { NextResponse } from "next/server";
import { getInfoBoardConfig } from "@/lib/info-board-store";

export const dynamic = "force-dynamic";

/** Public read endpoint polled by the /info kiosk board. */
export async function GET() {
  const config = await getInfoBoardConfig();
  return NextResponse.json({ ok: true, config });
}
