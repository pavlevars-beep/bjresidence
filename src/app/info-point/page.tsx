import type { Metadata } from "next";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { InfoPointLanguageProvider } from "@/i18n/InfoPointLanguageContext";
import { InfoPoint } from "@/components/info-point/InfoPoint";

// Content can change anytime via /admin — always read the latest, never
// statically cache this route (it also has no meaningful cache key/params).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Living at BJ — Info Point",
  description: "Digitalni vodič za stanare BJ Residence: Wi-Fi, kućni red, prijava kvara, prevoz i korisne informacije.",
  // Reached only via QR code / direct link — deliberately not discoverable via search.
  robots: { index: false, follow: false, nocache: true },
};

export default async function InfoPointPage({
  searchParams,
}: {
  searchParams: { kiosk?: string };
}) {
  const config = await getInfoPointConfig();
  return (
    <InfoPointLanguageProvider>
      <div className="min-h-screen bg-cream">
        <InfoPoint config={config} isKiosk={searchParams.kiosk === "1"} />
      </div>
    </InfoPointLanguageProvider>
  );
}
