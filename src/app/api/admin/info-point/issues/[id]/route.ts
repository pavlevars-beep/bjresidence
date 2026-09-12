import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateIssueStatus } from "@/lib/info-point-issues-store";
import { ISSUE_STATUSES, type IssueStatus } from "@/lib/info-point-issues";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !ISSUE_STATUSES.includes(body.status as IssueStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  const updated = await updateIssueStatus(params.id, body.status as IssueStatus);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, report: updated });
}
