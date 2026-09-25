import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getCabinViews } from "@/lib/residence/derive";
import { ResidentForm } from "@/components/admin/residence/ResidentForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dodaj gosta — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function NewResidentPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const cabins = await getCabinViews();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dodaj gosta</h1>
        <p className="mt-1 text-sm text-ink/55">Osnovni podaci, identifikacija, boravak i (opciono) prve uplate — sve na jednom mestu.</p>
      </div>
      <ResidentForm cabins={cabins} />
    </div>
  );
}
