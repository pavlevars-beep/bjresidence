import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import type { Contract, ContractStatus } from "./types";

const BLOB_PATH = "data/residence/contracts.json";

export async function getContracts(): Promise<Contract[]> {
  return readCollection<Contract>(BLOB_PATH);
}

export async function getContract(id: string): Promise<Contract | null> {
  const items = await getContracts();
  return items.find((c) => c.id === id) ?? null;
}

export async function getContractsForResident(residentId: string): Promise<Contract[]> {
  const items = await getContracts();
  return items.filter((c) => c.residentId === residentId);
}

export type NewContractInput = Omit<Contract, "id" | "createdAt" | "updatedAt">;

export async function createContract(input: NewContractInput): Promise<Contract> {
  const items = await getContracts();
  const now = new Date().toISOString();
  const contract: Contract = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  await writeCollection(BLOB_PATH, [...items, contract]);
  return contract;
}

export async function updateContractStatus(
  id: string,
  status: ContractStatus,
  patch?: Partial<Pick<Contract, "signedBlobPathname" | "signedAt" | "notes">>
): Promise<Contract | null> {
  const items = await getContracts();
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated: Contract = { ...items[index], ...patch, status, updatedAt: new Date().toISOString() };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}
