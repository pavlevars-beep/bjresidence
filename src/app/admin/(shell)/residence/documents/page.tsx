import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getDocuments } from "@/lib/residence/documents-store";
import { getResidents } from "@/lib/residence/residents-store";
import { DocumentsClient } from "@/components/admin/residence/DocumentsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dokumenta — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function DocumentsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [documents, residents] = await Promise.all([getDocuments(), getResidents()]);
  const residentById = new Map(residents.map((r) => [r.id, r]));
  const enriched = documents
    .map((d) => ({ ...d, residentName: residentById.get(d.residentId) ? `${residentById.get(d.residentId)!.firstName} ${residentById.get(d.residentId)!.lastName}` : "Nepoznat gost" }))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dokumenta</h1>
        <p className="mt-1 text-sm text-ink/55">Identifikacioni dokumenti gostiju — privatno, samo za administratora.</p>
      </div>
      <DocumentsClient initial={enriched} />
    </div>
  );
}
