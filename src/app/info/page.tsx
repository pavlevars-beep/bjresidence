import type { Metadata } from "next";
import { InfoBoardLanguageProvider } from "@/i18n/InfoBoardLanguageContext";
import { InfoBoard } from "@/components/info-board/InfoBoard";

export const metadata: Metadata = {
  title: "BJ Residence — Info",
  description: "Digitalna informativna tabla za BJ Residence.",
  robots: { index: false, follow: false },
};

export default function InfoPage() {
  return (
    <InfoBoardLanguageProvider>
      <InfoBoard />
    </InfoBoardLanguageProvider>
  );
}
