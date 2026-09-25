import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import type { DocumentType, ResidentDocument } from "./types";

const BLOB_PATH = "data/residence/documents.json";

export async function getDocuments(): Promise<ResidentDocument[]> {
  return readCollection<ResidentDocument>(BLOB_PATH);
}

export async function getDocument(id: string): Promise<ResidentDocument | null> {
  const items = await getDocuments();
  return items.find((d) => d.id === id) ?? null;
}

export async function getDocumentsForResident(residentId: string): Promise<ResidentDocument[]> {
  const items = await getDocuments();
  return items.filter((d) => d.residentId === residentId);
}

export type NewDocumentInput = {
  residentId: string;
  type: DocumentType;
  blobPathname: string;
  originalFilename: string;
  contentType: string;
  retained: boolean;
  extractedFieldsSnapshot?: Record<string, string> | null;
};

export async function createDocumentRecord(input: NewDocumentInput): Promise<ResidentDocument> {
  const items = await getDocuments();
  const doc: ResidentDocument = {
    id: randomUUID(),
    residentId: input.residentId,
    type: input.type,
    blobPathname: input.blobPathname,
    originalFilename: input.originalFilename,
    contentType: input.contentType,
    uploadedAt: new Date().toISOString(),
    retained: input.retained,
    extractedFieldsSnapshot: input.extractedFieldsSnapshot ?? null,
  };
  await writeCollection(BLOB_PATH, [...items, doc]);
  return doc;
}

/** Removes the document metadata record only — deleting the underlying blob is the caller's job (residence-uploads.ts). */
export async function deleteDocumentRecord(id: string): Promise<ResidentDocument | null> {
  const items = await getDocuments();
  const doc = items.find((d) => d.id === id);
  if (!doc) return null;
  await writeCollection(BLOB_PATH, items.filter((d) => d.id !== id));
  return doc;
}
