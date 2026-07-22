import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uslovi korišćenja | BJ Residence",
};

export default function TermsPage() {
  return <LegalPage page="terms" />;
}
