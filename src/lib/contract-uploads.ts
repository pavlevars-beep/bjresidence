import { del, get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Private storage for contract templates, generated contracts, and signed
 * copies — same private-blob-with-local-fallback pattern as
 * residence-uploads.ts. Never public; always served through an
 * authenticated streaming route.
 */
const TEMPLATE_PREFIX = "uploads/contract-templates/";
const GENERATED_PREFIX = "uploads/contracts/";
const SIGNED_PREFIX = "uploads/signed-contracts/";

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const SIGNED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export const MAX_TEMPLATE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_SIGNED_BYTES = 15 * 1024 * 1024; // 15MB

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function localPath(pathname: string): string {
  // pathname already starts with "uploads/..." — join under data/
  return path.join(process.cwd(), "data", pathname);
}

async function saveBuffer(pathname: string, buffer: Buffer, contentType: string): Promise<string> {
  if (hasBlobToken()) {
    await put(pathname, buffer, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType });
    return pathname;
  }
  const filePath = localPath(pathname);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return pathname;
}

export function isDocxFile(type: string): boolean {
  return type === DOCX_TYPE;
}

export function isSignedFileType(type: string): boolean {
  return type in SIGNED_TYPES;
}

/** Uploaded template DOCX from the admin's own file picker. */
export async function saveTemplateFile(file: File): Promise<string> {
  if (!isDocxFile(file.type)) throw new Error("unsupported_type");
  if (file.size > MAX_TEMPLATE_BYTES) throw new Error("too_large");
  const buffer = Buffer.from(await file.arrayBuffer());
  const pathname = `${TEMPLATE_PREFIX}${randomUUID()}.docx`;
  return saveBuffer(pathname, buffer, DOCX_TYPE);
}

/** Server-generated contract DOCX (a filled-template Buffer, not a File). */
export async function saveGeneratedContract(buffer: Buffer): Promise<string> {
  const pathname = `${GENERATED_PREFIX}${randomUUID()}.docx`;
  return saveBuffer(pathname, buffer, DOCX_TYPE);
}

/** Uploaded scan/photo of the physically-signed contract. */
export async function saveSignedContract(file: File): Promise<string> {
  const ext = SIGNED_TYPES[file.type];
  if (!ext) throw new Error("unsupported_type");
  if (file.size > MAX_SIGNED_BYTES) throw new Error("too_large");
  const buffer = Buffer.from(await file.arrayBuffer());
  const pathname = `${SIGNED_PREFIX}${randomUUID()}.${ext}`;
  return saveBuffer(pathname, buffer, file.type);
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  docx: DOCX_TYPE,
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
};

export async function readContractFile(pathname: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!pathname.startsWith(TEMPLATE_PREFIX) && !pathname.startsWith(GENERATED_PREFIX) && !pathname.startsWith(SIGNED_PREFIX)) {
    return null;
  }

  if (hasBlobToken()) {
    try {
      const result = await get(pathname, { access: "private" });
      if (!result || !result.stream) return null;
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      return { buffer, contentType: result.blob.contentType || "application/octet-stream" };
    } catch {
      return null;
    }
  }

  try {
    const buffer = await fs.readFile(localPath(pathname));
    const ext = path.extname(pathname).slice(1);
    return { buffer, contentType: CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export async function deleteContractFile(pathname: string): Promise<void> {
  if (hasBlobToken()) {
    try {
      await del(pathname);
    } catch (err) {
      console.error("[contract-uploads] blob delete failed:", err);
    }
    return;
  }
  try {
    await fs.unlink(localPath(pathname));
  } catch {
    // already gone — fine
  }
}

