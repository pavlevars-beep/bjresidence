import type { Metadata, Viewport } from "next";
// Self-hosted (pinned in package-lock) rather than next/font/google: fetching
// from Google at build time let a Google Fonts update plus a stale build cache
// produce mismatched class hashes between the HTML and the CSS, which silently
// dropped the font site-wide.
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LodgingSchema } from "@/components/Schema";

export const metadata: Metadata = {
  metadataBase: new URL("https://bjresidence.rs"),
  title: "BJ Residence | Beograd",
  description:
    "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g. Namenjeno zaposlenima, studentima i ljudima na privremenom boravku.",
  openGraph: {
    title: "BJ Residence",
    description: "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g.",
    url: "https://bjresidence.rs",
    siteName: "BJ Residence",
    images: [{ url: "/images/og/og-image.png", width: 1200, height: 630 }],
    locale: "sr_RS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BJ Residence",
    description: "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g.",
    images: ["/images/og/og-image.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  appleWebApp: {
    capable: true,
    title: "BJ Residence",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F4EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <head>
        <LodgingSchema />
      </head>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
