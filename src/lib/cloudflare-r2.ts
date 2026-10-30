/**
 * Cloudflare R2 access for the Workers/OpenNext deployment — the counterpart
 * to @vercel/blob for the Cloudflare build. Resolves to null on every other
 * platform (Vercel, local dev, `next build`/`tsc`), so every call site falls
 * back to its existing @vercel/blob / local-filesystem branch unchanged.
 *
 * Deliberately typed against a minimal local interface rather than the
 * ambient `R2Bucket` type from `@cloudflare/workers-types` / the generated
 * `wrangler types` output, so the Vercel build never needs that generated
 * file to type-check.
 */

export interface R2ObjectBodyLike {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
}

export interface R2BucketLike {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

let cached: R2BucketLike | null | undefined;

export async function getR2Bucket(): Promise<R2BucketLike | null> {
  if (cached !== undefined) return cached;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as Record<string, unknown>;
    cached = (env.BJ_RESIDENCE_BUCKET as R2BucketLike | undefined) ?? null;
  } catch {
    cached = null;
  }
  return cached;
}
