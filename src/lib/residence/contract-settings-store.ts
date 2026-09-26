import { readJsonBlob, writeJsonBlob } from "../blob-store";
import type { ContractSettings } from "./types";

const BLOB_PATH = "data/residence/contract-settings.json";

function defaults(): ContractSettings {
  return {
    landlordName: "",
    landlordAddress: "",
    landlordId: "",
    updatedAt: new Date().toISOString(),
  };
}

export async function getContractSettings(): Promise<ContractSettings> {
  const parsed = await readJsonBlob<Partial<ContractSettings>>(BLOB_PATH);
  if (!parsed) return defaults();
  return { ...defaults(), ...parsed };
}

export async function setContractSettings(patch: Partial<ContractSettings>): Promise<ContractSettings> {
  const current = await getContractSettings();
  const next: ContractSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeJsonBlob(BLOB_PATH, next);
  return next;
}
