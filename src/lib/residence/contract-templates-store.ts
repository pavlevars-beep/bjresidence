import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import type { ContractTemplate } from "./types";

const BLOB_PATH = "data/residence/contract-templates.json";

export async function getContractTemplates(): Promise<ContractTemplate[]> {
  return readCollection<ContractTemplate>(BLOB_PATH);
}

export async function getContractTemplate(id: string): Promise<ContractTemplate | null> {
  const items = await getContractTemplates();
  return items.find((t) => t.id === id) ?? null;
}

export async function getActiveContractTemplates(): Promise<ContractTemplate[]> {
  const items = await getContractTemplates();
  return items.filter((t) => t.active);
}

export type NewContractTemplateInput = Omit<ContractTemplate, "id" | "uploadedAt">;

export async function createContractTemplate(input: NewContractTemplateInput): Promise<ContractTemplate> {
  const items = await getContractTemplates();
  const template: ContractTemplate = { ...input, id: randomUUID(), uploadedAt: new Date().toISOString() };
  await writeCollection(BLOB_PATH, [...items, template]);
  return template;
}

export async function updateContractTemplate(id: string, patch: Partial<ContractTemplate>): Promise<ContractTemplate | null> {
  const items = await getContractTemplates();
  const index = items.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated: ContractTemplate = { ...items[index], ...patch, id };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}
