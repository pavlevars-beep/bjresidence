import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getResident } from "@/lib/residence/residents-store";
import { getStaysForResident } from "@/lib/residence/stays-store";
import { getPaymentsForResident, getDepositHeld } from "@/lib/residence/payments-store";
import { getDocumentsForResident } from "@/lib/residence/documents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { getContractsForResident } from "@/lib/residence/contracts-store";
import { ResidentProfile } from "@/components/admin/residence/ResidentProfile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil gosta — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function ResidentProfilePage({ params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const resident = await getResident(params.id);
  if (!resident) notFound();

  const [stays, payments, documents, cabins, depositHeld, contracts] = await Promise.all([
    getStaysForResident(resident.id),
    getPaymentsForResident(resident.id),
    getDocumentsForResident(resident.id),
    getCabins(),
    getDepositHeld(resident.id),
    getContractsForResident(resident.id),
  ]);

  return (
    <ResidentProfile
      resident={resident}
      stays={stays}
      payments={payments}
      documents={documents}
      contracts={contracts}
      cabins={cabins}
      depositHeld={depositHeld}
    />
  );
}
