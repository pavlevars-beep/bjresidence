import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { LodgingSchema } from "@/components/Schema";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bjresidence.rs"),
  title: "BJ Residence — Worker Living | Beograd",
  description:
    "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g. Namenjeno radnicima, studentima i ljudima na privremenom boravku.",
  openGraph: {
    title: "BJ Residence — Worker Living",
    description: "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g.",
    url: "https://bjresidence.rs",
    siteName: "BJ Residence",
    images: [{ url: "/images/og/og-image.png", width: 1200, height: 630 }],
    locale: "sr_RS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BJ Residence — Worker Living",
    description: "Uredan i miran zajednički smeštaj u Beogradu, Braće Jerković 112g.",
    images: ["/images/og/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={jakarta.variable}>
      <head>
        <LodgingSchema />
      </head>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased pb-16 lg:pb-0">
        <LanguageProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
          <MobileStickyCta />
        </LanguageProvider>
      </body>
    </html>
  );
}
