import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/info"] },
    sitemap: "https://bjresidence.rs/sitemap.xml",
  };
}
