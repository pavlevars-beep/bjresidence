import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getWebsiteSettings, setWebsiteSettings } from "@/lib/residence/website-settings-store";
import type { WebsiteSettings } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const settings = await getWebsiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const patch = (await request.json().catch(() => null)) as Partial<WebsiteSettings> | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const settings = await setWebsiteSettings(patch);
  return NextResponse.json({ ok: true, settings });
}
