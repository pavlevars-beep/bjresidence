import { readJsonBlob, writeJsonBlob } from "../blob-store";

/** Thin generic array read/write on top of blob-store.ts, shared by every residence collection. */
export async function readCollection<T>(blobPath: string): Promise<T[]> {
  const parsed = await readJsonBlob<T[]>(blobPath);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeCollection<T>(blobPath: string, items: T[]): Promise<void> {
  await writeJsonBlob(blobPath, items);
}
