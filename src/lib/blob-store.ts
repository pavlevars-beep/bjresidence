import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny "JSON blob as a database" helper built on Vercel Blob — the durable
 * replacement for this project's original local-JSON-file pattern, which
 * silently failed to persist on Vercel's read-only serverless filesystem
 * (this was flagged repeatedly as a known limitation before this file
 * existed). Every JSON store in the project (info board, info point, issue
 * reports, availability) goes through this.
 *
 * Blobs are stored with `access: "private"` — they are never reachable by a
 * public URL, only through this helper using BLOB_READ_WRITE_TOKEN.
 *
 * Local dev without BLOB_READ_WRITE_TOKEN configured transparently falls
 * back to a local JSON file under data/, so `npm run dev` keeps working with
 * zero setup — only production needs the Blob store connected.
 */

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function localFilePath(pathname: string): string {
  return path.join(process.cwd(), pathname);
}

export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  if (hasBlobToken()) {
    try {
      const result = await get(pathname, { access: "private" });
      if (!result || !result.stream) return null;
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  try {
    const raw = await fs.readFile(localFilePath(pathname), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonBlob<T>(pathname: string, data: T): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  if (hasBlobToken()) {
    await put(pathname, json, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  const filePath = localFilePath(pathname);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, json);
}
