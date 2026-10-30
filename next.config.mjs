/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Vercel's build still uses its own optimizer; Cloudflare Workers has none,
    // so the Cloudflare build (see the cf:build script) sets this flag to fall
    // back to serving the already-hand-optimized webp/avif sources unresized.
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
