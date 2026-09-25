import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNotificationSettings, setNotificationSettings } from "@/lib/residence/notification-settings-store";
import type { NotificationSettings } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const settings = await getNotificationSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const patch = (await request.json().catch(() => null)) as Partial<NotificationSettings> | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const settings = await setNotificationSettings(patch);
  return NextResponse.json({ ok: true, settings });
}
