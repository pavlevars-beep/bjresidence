import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getIssueReports } from "@/lib/info-point-issues-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const reports = await getIssueReports();
  return NextResponse.json({ ok: true, reports });
}
