import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { getR2Bucket } from "./cloudflare-r2";

/**
 * Tiny "JSON blob as a database" helper — Cloudflare R2 on the Workers
 * deployment, Vercel Blob on the Vercel deployment, a local JSON file under
 * data/ in dev. Every JSON store in the project (info board, info point,
 * issue reports, availability) goes through this. Same codebase, same keys,
 * three backends selected at runtime — see cloudflare-r2.ts and the
 * `hasBlobToken()` check below.
 *
 * Blobs/objects are never reachable by a public URL, only through this
 * helper.
 */

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function localFilePath(pathname: string): string {
  return path.join(process.cwd(), pathname);
}

export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  const bucket = await getR2Bucket();
  if (bucket) {
    try {
      const obj = await bucket.get(pathname);
      if (!obj) return null;
      return JSON.parse(new TextDecoder().decode(await obj.arrayBuffer())) as T;
    } catch {
      return null;
    }
  }

  if (hasBlobToken()) {
    try {
      // useCache defaults to true in the SDK, which reads through Vercel Blob's
      // CDN cache and can serve a stale pre-write version for a short window
      // right after a write — invisible in local dev (filesystem fallback, no
      // caching), but the cause of intermittent "just-created record not found"
      // 404s in production. Always read fresh from origin.
      const result = await get(pathname, { access: "private", useCache: false });
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

  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(pathname, json, { httpMetadata: { contentType: "application/json" } });
    return;
  }

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
