import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createContractTemplate, getContractTemplates } from "@/lib/residence/contract-templates-store";
import { isDocxFile, saveTemplateFile, MAX_TEMPLATE_BYTES } from "@/lib/contract-uploads";
import { scanPlaceholders } from "@/lib/residence/docx-template-engine";
import { KNOWN_VARIABLE_KEYS } from "@/lib/residence/contract-variables";
import { logActivity } from "@/lib/residence/activity-log-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const templates = await getContractTemplates();
  return NextResponse.json({ ok: true, templates });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const file = formData.get("file");
  const name = String(formData.get("name") ?? "").trim();
  const contractType = String(formData.get("contractType") ?? "monthly_individual");
  const language = String(formData.get("language") ?? "sr");
  const version = String(formData.get("version") ?? "1.0");
  const notes = String(formData.get("notes") ?? "");
  const active = formData.get("active") === "true";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "missing_name" }, { status: 400 });
  }
  if (!isDocxFile(file.type)) {
    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
  }
  if (file.size > MAX_TEMPLATE_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let detectedPlaceholders: string[];
  try {
    detectedPlaceholders = scanPlaceholders(buffer);
  } catch (err) {
    console.error("[contract-templates] failed to scan placeholders:", err);
    return NextResponse.json({ ok: false, error: "invalid_docx" }, { status: 400 });
  }

  const blobPathname = await saveTemplateFile(file);

  const template = await createContractTemplate({
    name,
    contractType,
    language,
    version,
    active,
    notes,
    blobPathname,
    originalFilename: file.name,
    detectedPlaceholders,
    customVariableDefaults: {},
  });

  const unknownPlaceholders = detectedPlaceholders.filter((p) => !KNOWN_VARIABLE_KEYS.has(p));

  await logActivity("contract_template_uploaded", `Šablon ugovora "${name}" (v${version}) otpremljen`, "contract_template", template.id);

  return NextResponse.json({ ok: true, template, unknownPlaceholders });
}
