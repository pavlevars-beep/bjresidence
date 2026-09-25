import { del, get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Storage for resident identification documents (passport photos) — private
 * Vercel Blob in production, never reachable by a public URL, only through
 * this file's functions using BLOB_READ_WRITE_TOKEN; a local disk folder in
 * dev. Pathnames are random UUIDs, never derived from resident name/number.
 */
const uploadsDir = path.join(process.cwd(), "data", "uploads", "residence-documents");
const BLOB_PREFIX = "uploads/residence-documents/";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function isAllowedDocumentType(type: string): boolean {
  return type in ALLOWED_TYPES;
}

/** Returns the stored blob pathname — safe to embed in the ResidentDocument record. */
export async function saveResidentDocument(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("unsupported_type");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("too_large");

  const filename = `${randomUUID()}.${ext}`;

  if (hasBlobToken()) {
    await put(`${BLOB_PREFIX}${filename}`, file, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.type,
    });
    return `${BLOB_PREFIX}${filename}`;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return `${BLOB_PREFIX}${filename}`;
}

export async function readResidentDocument(pathname: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!pathname.startsWith(BLOB_PREFIX)) return null;
  const filename = pathname.slice(BLOB_PREFIX.length);

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
    const buffer = await fs.readFile(path.join(uploadsDir, filename));
    const ext = path.extname(filename).slice(1);
    const contentType = Object.entries(ALLOWED_TYPES).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
    return { buffer, contentType };
  } catch {
    return null;
  }
}

export async function deleteResidentDocument(pathname: string): Promise<void> {
  if (!pathname.startsWith(BLOB_PREFIX)) return;
  const filename = pathname.slice(BLOB_PREFIX.length);

  if (hasBlobToken()) {
    try {
      await del(pathname);
    } catch (err) {
      console.error("[residence-uploads] blob delete failed:", err);
    }
    return;
  }

  try {
    await fs.unlink(path.join(uploadsDir, filename));
  } catch {
    // already gone — fine
  }
}
