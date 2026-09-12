import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Storage for resident-submitted issue photos — private Vercel Blob in
 * production (never reachable by a public URL, only through this file's
 * functions using BLOB_READ_WRITE_TOKEN), a local disk folder in dev.
 * Scoped to just this one upload path rather than a general media library —
 * see the project's Info Point report for why file uploads elsewhere in
 * admin (place photos, device-guide images) stay URL-based instead.
 */
const uploadsDir = path.join(process.cwd(), "data", "uploads", "info-point");
const BLOB_PREFIX = "uploads/info-point/";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function isAllowedImageType(type: string): boolean {
  return type in ALLOWED_TYPES;
}

/** Returns the stored filename (not a full path/URL) — safe to embed in JSON and API paths. */
export async function saveIssuePhoto(file: File): Promise<string> {
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
    return filename;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return filename;
}

const SAFE_FILENAME = /^[a-f0-9-]+\.(jpg|png|webp)$/;

export function isSafeUploadFilename(filename: string): boolean {
  return SAFE_FILENAME.test(filename);
}

export async function readIssuePhoto(filename: string): Promise<Buffer | null> {
  if (!isSafeUploadFilename(filename)) return null;

  if (hasBlobToken()) {
    try {
      const result = await get(`${BLOB_PREFIX}${filename}`, { access: "private" });
      if (!result || !result.stream) return null;
      return Buffer.from(await new Response(result.stream).arrayBuffer());
    } catch {
      return null;
    }
  }

  try {
    return await fs.readFile(path.join(uploadsDir, filename));
  } catch {
    return null;
  }
}
