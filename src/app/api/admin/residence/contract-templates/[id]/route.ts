import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getContractTemplate, updateContractTemplate } from "@/lib/residence/contract-templates-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import type { ContractTemplate } from "@/lib/residence/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const template = await getContractTemplate(params.id);
  if (!template) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, template });
}

type TemplatePatch = Partial<Pick<ContractTemplate, "active" | "notes" | "customVariableDefaults" | "name">>;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const patch = (await request.json().catch(() => null)) as TemplatePatch | null;
  if (!patch) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });

  const updated = await updateContractTemplate(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  if (patch.active !== undefined) {
    await logActivity(
      "contract_template_status",
      `Šablon "${updated.name}" ${patch.active ? "aktiviran" : "deaktiviran"}`,
      "contract_template",
      updated.id
    );
  }

  return NextResponse.json({ ok: true, template: updated });
}
