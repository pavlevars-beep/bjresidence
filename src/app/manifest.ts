import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJ Residence",
    short_name: "BJ Residence",
    description: "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4EE",
    theme_color: "#F7F4EE",
    lang: "sr",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
