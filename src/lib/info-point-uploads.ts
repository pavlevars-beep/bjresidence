import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Minimal local-disk storage for resident-submitted issue photos. Deliberately
 * scoped to just this one upload path (rather than a general media library)
 * — see the project's Info Point report for why: without real object storage
 * (e.g. Vercel Blob) configured, anything written here doesn't reliably
 * survive on Vercel's serverless filesystem. Works fully in local/dev and on
 * any host with a persistent filesystem.
 */
const uploadsDir = path.join(process.cwd(), "data", "uploads", "info-point");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function isAllowedImageType(type: string): boolean {
  return type in ALLOWED_TYPES;
}

/** Returns the stored filename (not a full path) — safe to embed in JSON/URLs. */
export async function saveIssuePhoto(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("unsupported_type");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("too_large");

  const filename = `${randomUUID()}.${ext}`;
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
  try {
    return await fs.readFile(path.join(uploadsDir, filename));
  } catch {
    return null;
  }
}
