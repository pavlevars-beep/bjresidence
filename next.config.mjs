/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Cloudflare Workers has no image optimizer, so the Cloudflare build (see
    // the cf:build script) serves the already-hand-optimized webp/avif sources
    // unresized.
    // Revisit with @opennextjs/cloudflare's `images.binding` support if
    // on-the-fly resizing is needed there later.
    unoptimized: !!process.env.OPEN_NEXT_CLOUDFLARE_BUILD,
  },
};

export default nextConfig;

// Only wires up Cloudflare's local Miniflare bindings during `npm run cf:dev`;
// no-op everywhere else (Vercel build/runtime, plain `next dev`).
if (process.env.OPEN_NEXT_CLOUDFLARE_DEV) {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  await initOpenNextCloudflareForDev();
}
