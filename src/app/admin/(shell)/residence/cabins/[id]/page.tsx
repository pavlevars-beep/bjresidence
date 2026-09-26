import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getCabinViews } from "@/lib/residence/derive";
import { getStaysForCabin, getStaysForResident } from "@/lib/residence/stays-store";
import { getResidents } from "@/lib/residence/residents-store";
import { getPaymentsForResident } from "@/lib/residence/payments-store";
import { getDocumentsForResident } from "@/lib/residence/documents-store";
import { getCabins } from "@/lib/residence/cabins-store";
import { getContractsForResident } from "@/lib/residence/contracts-store";
import { SectionCard } from "@/components/admin/ui";
import { CabinStatusBadge } from "@/components/admin/residence/status-badges";
import { ResidentProfile } from "@/components/admin/residence/ResidentProfile";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kabina — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function CabinDetailPage({ params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [views, stays, residents] = await Promise.all([getCabinViews(), getStaysForCabin(params.id), getResidents()]);
  const view = views.find((v) => v.cabin.id === params.id);
  if (!view) notFound();

  const residentById = new Map(residents.map((r) => [r.id, r]));
  const sortedStays = [...stays].sort((a, b) => b.moveInDate.localeCompare(a.moveInDate));

  // When the cabin has an active resident, load the same data the resident's
  // own profile page uses so every edit action (uplate, odluka, premeštaj,
  // brisanje) is available here too — not just a read-only summary.
  let residentProfileData: {
    resident: NonNullable<typeof view.resident>;
    stays: Awaited<ReturnType<typeof getStaysForResident>>;
    payments: Awaited<ReturnType<typeof getPaymentsForResident>>;
    documents: Awaited<ReturnType<typeof getDocumentsForResident>>;
    contracts: Awaited<ReturnType<typeof getContractsForResident>>;
    cabins: Awaited<ReturnType<typeof getCabins>>;
  } | null = null;

  if (view.resident && view.activeStay) {
    const resident = view.resident;
    const [residentStays, residentPayments, residentDocuments, residentContracts, allCabins] = await Promise.all([
      getStaysForResident(resident.id),
      getPaymentsForResident(resident.id),
      getDocumentsForResident(resident.id),
      getContractsForResident(resident.id),
      getCabins(),
    ]);
    residentProfileData = { resident, stays: residentStays, payments: residentPayments, documents: residentDocuments, contracts: residentContracts, cabins: allCabins };
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-wood">Kabina {view.cabin.number}</p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{view.cabin.name}</h1>
          <CabinStatusBadge status={view.liveStatus} />
        </div>
      </div>

      <SectionCard title="Kabina">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Podrazumevana mesečna kirija</dt>
            <dd className="mt-1 text-sm text-ink">{view.cabin.monthlyRentDefault} {view.cabin.currency}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Očekivano slobodno</dt>
            <dd className="mt-1 text-sm text-ink">{view.availableFrom ?? "—"}</dd>
          </div>
          {view.cabin.maintenanceFlag && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Napomena o održavanju</dt>
              <dd className="mt-1 text-sm text-ink">{view.cabin.maintenanceNote || "—"}</dd>
            </div>
          )}
        </dl>
        <Link
          href="/admin/residence/cabins"
          className="mt-4 inline-block rounded-full bg-ink/5 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/10"
        >
          Podesi održavanje / cenu →
        </Link>
      </SectionCard>

      {residentProfileData ? (
        <ResidentProfile
          resident={residentProfileData.resident}
          stays={residentProfileData.stays}
          payments={residentProfileData.payments}
          documents={residentProfileData.documents}
          contracts={residentProfileData.contracts}
          cabins={residentProfileData.cabins}
        />
      ) : (
        <SectionCard title="Trenutni gost">
          <p className="text-sm text-ink/50">Kabina je trenutno prazna — nema gosta za upravljanje.</p>
        </SectionCard>
      )}

      <SectionCard title="Istorija boravaka" description="Svi gosti koji su boravili u ovoj kabini.">
        {sortedStays.length === 0 ? (
          <p className="text-sm text-ink/50">Nema zabeleženih boravaka.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedStays.map((stay) => {
              const resident = residentById.get(stay.residentId);
              return (
                <li key={stay.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                  <Link href={`/admin/residence/residents/${stay.residentId}`} className="text-sm font-medium text-ink hover:underline">
                    {resident ? `${resident.firstName} ${resident.lastName}` : "Nepoznat gost"}
                  </Link>
                  <span className="text-xs text-ink/50">
                    {stay.moveInDate} → {stay.actualMoveOutDate ?? (stay.status === "active" ? "sada" : "—")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
