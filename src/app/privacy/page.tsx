import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privatnost | BJ Residence",
};

export default function PrivacyPage() {
  return <LegalPage page="privacy" />;
}
