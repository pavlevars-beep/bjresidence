import { del, get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getR2Bucket } from "./cloudflare-r2";

/**
 * Storage for resident identification documents (passport photos) — never
 * reachable by a public URL, only through this file's functions. Cloudflare
 * R2 on the Workers deployment, private Vercel Blob on the Vercel
 * deployment, a local disk folder in dev. Pathnames are random UUIDs, never
 * derived from resident name/number.
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

  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(`${BLOB_PREFIX}${filename}`, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    return `${BLOB_PREFIX}${filename}`;
  }

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

  const bucket = await getR2Bucket();
  if (bucket) {
    try {
      const obj = await bucket.get(pathname);
      if (!obj) return null;
      return { buffer: Buffer.from(await obj.arrayBuffer()), contentType: obj.httpMetadata?.contentType || "application/octet-stream" };
    } catch {
      return null;
    }
  }

  if (hasBlobToken()) {
    try {
      const result = await get(pathname, { access: "private", useCache: false });
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

  const bucket = await getR2Bucket();
  if (bucket) {
    try {
      await bucket.delete(pathname);
    } catch (err) {
      console.error("[residence-uploads] R2 delete failed:", err);
    }
    return;
  }

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
