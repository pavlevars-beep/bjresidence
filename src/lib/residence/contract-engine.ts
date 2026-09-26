import { getResident } from "./residents-store";
import { getStay } from "./stays-store";
import { getCabins } from "./cabins-store";
import { getPaymentsForStay, getDepositHeld } from "./payments-store";
import { getContractSettings } from "./contract-settings-store";
import { getWebsiteSettings } from "./website-settings-store";
import { getContractTemplate } from "./contract-templates-store";
import { createContract } from "./contracts-store";
import { buildContractVariables, findMissingRequiredVariables, type ContractVariableDef } from "./contract-variables";
import { renderTemplate } from "./docx-template-engine";
import { readContractFile, saveGeneratedContract } from "../contract-uploads";
import { logActivity } from "./activity-log-store";
import type { Cabin, Contract, ContractSettings, Resident, Stay } from "./types";

export interface ContractContext {
  resident: Resident;
  stay: Stay;
  cabin: Cabin;
  contractSettings: ContractSettings;
  variables: Record<string, string>;
  missing: ContractVariableDef[];
}

/** Deterministic — same inputs always produce the same variable set. Shared by preview and generate so they can never drift apart. */
export async function loadContractContext(residentId: string, stayId: string): Promise<ContractContext | null> {
  const [resident, stay, cabins, contractSettings, stayPayments, depositHeld, websiteSettings] = await Promise.all([
    getResident(residentId),
    getStay(stayId),
    getCabins(),
    getContractSettings(),
    getPaymentsForStay(stayId),
    getDepositHeld(residentId),
    getWebsiteSettings(),
  ]);

  if (!resident || !stay) return null;
  const cabin = cabins.find((c) => c.id === stay.cabinId);
  if (!cabin) return null;

  const depositAmount = depositHeld > 0 ? depositHeld : websiteSettings.deposit ?? 0;
  const firstRentPayment = stayPayments
    .filter((p) => p.type === "rent")
    .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate))[0];

  const variables = buildContractVariables({
    resident,
    stay,
    cabin,
    contractSettings,
    depositAmount,
    initialPaymentDate: firstRentPayment?.paymentDate ?? null,
  });

  return { resident, stay, cabin, contractSettings, variables, missing: findMissingRequiredVariables(variables) };
}

function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Never includes the passport number — only name, cabin, date. */
export function buildContractFilename(resident: Resident, cabin: Cabin, dateISO: string): string {
  const first = sanitizeFilenamePart(resident.firstName) || "Gost";
  const last = sanitizeFilenamePart(resident.lastName) || "";
  const cabinName = sanitizeFilenamePart(cabin.name);
  return `BJ-Residence_${first}-${last}_${cabinName}_${dateISO}.docx`;
}

export type GenerateContractResult =
  | { ok: true; contract: Contract }
  | { ok: false; error: "not_found" | "template_not_found" | "template_file_missing" | "missing_required"; missing?: ContractVariableDef[] };

export async function generateContract(params: {
  residentId: string;
  stayId: string;
  templateId: string;
  overrideMissing?: boolean;
}): Promise<GenerateContractResult> {
  const ctx = await loadContractContext(params.residentId, params.stayId);
  if (!ctx) return { ok: false, error: "not_found" };

  if (ctx.missing.length > 0 && !params.overrideMissing) {
    return { ok: false, error: "missing_required", missing: ctx.missing };
  }

  const template = await getContractTemplate(params.templateId);
  if (!template) return { ok: false, error: "template_not_found" };

  const templateFile = await readContractFile(template.blobPathname);
  if (!templateFile) return { ok: false, error: "template_file_missing" };

  // Known variables always win over a template's static custom defaults —
  // defaults only fill in placeholders the system doesn't otherwise know.
  const mergedVariables = { ...template.customVariableDefaults, ...ctx.variables };

  const buffer = renderTemplate(templateFile.buffer, mergedVariables);
  const docxBlobPathname = await saveGeneratedContract(buffer);

  const contract = await createContract({
    residentId: params.residentId,
    stayId: params.stayId,
    cabinId: ctx.cabin.id,
    templateId: template.id,
    templateVersion: template.version,
    contractType: template.contractType,
    generatedAt: new Date().toISOString(),
    contractStartDate: ctx.stay.moveInDate,
    status: "generated",
    docxBlobPathname,
    pdfBlobPathname: null,
    signedBlobPathname: null,
    signedAt: null,
    notes: "",
    dataSnapshot: mergedVariables,
  });

  await logActivity(
    "contract_generated",
    `Ugovor "${template.name}" generisan za ${ctx.resident.firstName} ${ctx.resident.lastName} (${ctx.cabin.name})`,
    "contract",
    contract.id
  );

  return { ok: true, contract };
}
