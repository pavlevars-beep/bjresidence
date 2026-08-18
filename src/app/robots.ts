import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/infopult"] },
    sitemap: "https://bjresidence.rs/sitemap.xml",
  };
}
