import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getContractTemplates } from "@/lib/residence/contract-templates-store";
import { getContractSettings } from "@/lib/residence/contract-settings-store";
import { CONTRACT_VARIABLES } from "@/lib/residence/contract-variables";
import { SectionCard } from "@/components/admin/ui";
import { ContractTemplatesManager } from "@/components/admin/residence/ContractTemplatesManager";
import { ContractSettingsEditor } from "@/components/admin/residence/ContractSettingsEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Šabloni ugovora — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function ContractTemplatesPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [templates, contractSettings] = await Promise.all([getContractTemplates(), getContractSettings()]);
  const sorted = [...templates].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Šabloni ugovora</h1>
        <p className="mt-1 text-sm text-ink/55">
          Otpremite odobreni DOCX šablon sa poljima poput <code>{"{{resident_full_name}}"}</code> — sistem samo popunjava vrednosti, nikad ne menja tekst ugovora.
        </p>
      </div>

      <ContractTemplatesManager initial={sorted} />

      <SectionCard title="Mapiranje polja šablona" description="Koja polja šablon prepoznaje i odakle dolaze vrednosti.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                <th className="py-2 pr-3">Polje u šablonu</th>
                <th className="py-2 pr-3">Izvor podataka</th>
                <th className="py-2">Obavezno</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACT_VARIABLES.map((v) => (
                <tr key={v.key} className="border-b border-ink/5">
                  <td className="py-2 pr-3 font-mono text-xs text-ink/80">{`{{${v.key}}}`}</td>
                  <td className="py-2 pr-3 text-ink/60">{v.source}</td>
                  <td className="py-2">
                    {v.required ? (
                      <span className="rounded-full bg-wood/10 px-2 py-0.5 text-xs font-semibold text-wood">Da</span>
                    ) : (
                      <span className="text-xs text-ink/35">Ne</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ContractSettingsEditor initial={contractSettings} />
    </div>
  );
}
