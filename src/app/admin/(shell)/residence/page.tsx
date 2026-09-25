import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getCabinViews, getResidenceStats, getUpcoming } from "@/lib/residence/derive";
import { listActivity } from "@/lib/residence/activity-log-store";
import { SectionCard } from "@/components/admin/ui";
import { CabinStatusBadge, PaymentStatusBadge } from "@/components/admin/residence/status-badges";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pregled smeštaja — BJ Residence Admin", robots: { index: false, follow: false } };

const UPCOMING_LABEL: Record<string, string> = {
  decision_needed: "Odluka o nastavku",
  payment_due: "Uplata dospeva",
  move_out: "Očekivano iseljenje",
};

export default async function ResidenceOverviewPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [cabins, stats, upcoming, activity] = await Promise.all([
    getCabinViews(),
    getResidenceStats(),
    getUpcoming(7),
    listActivity(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Pregled smeštaja</h1>
          <p className="mt-1 text-sm text-ink/55">4 kabine — stanje u realnom vremenu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/residence/residents/new" className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-medium text-cream hover:bg-[#4a5241]">
            <Plus size={15} /> Dodaj gosta
          </Link>
          <Link href="/admin/residence/reservations" className="flex items-center gap-1.5 rounded-full bg-ink/5 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/10">
            <Plus size={15} /> Rezervacija
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cabins.map((view) => (
          <Link
            key={view.cabin.id}
            href={`/admin/residence/cabins/${view.cabin.id}`}
            className="rounded-2xl border border-ink/8 bg-white/70 p-4 shadow-soft transition-shadow hover:shadow-card"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold uppercase tracking-wide text-ink">{view.cabin.name}</p>
              <CabinStatusBadge status={view.liveStatus} />
            </div>
            {view.resident ? (
              <div className="mt-2.5 text-sm text-ink/70">
                <p className="font-medium text-ink">{view.resident.firstName} {view.resident.lastName}</p>
                {view.activeStay && (
                  <p className="mt-0.5 text-xs text-ink/50">
                    Plaćeno do {view.activeStay.currentPeriodEnd}
                    {view.paymentStatus && (
                      <span className="ml-1.5 inline-block align-middle">
                        <PaymentStatusBadge status={view.paymentStatus} />
                      </span>
                    )}
                  </p>
                )}
                {view.availableFrom && <p className="mt-1 text-xs font-medium text-wood">Slobodno od {view.availableFrom}</p>}
              </div>
            ) : (
              <p className="mt-2.5 text-sm text-ink/45">{view.liveStatus === "available" ? "Nema gosta" : "—"}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Zauzeto" value={String(stats.occupied)} />
        <StatTile label="Slobodno" value={String(stats.available)} />
        <StatTile label="Rezervisano" value={String(stats.reserved)} />
        <StatTile label="Održavanje" value={String(stats.maintenance)} />
        <StatTile label="Mesečni prihod" value={`${stats.monthlyRecurringRent} €`} />
        <StatTile label="Depoziti na čuvanju" value={`${stats.depositsHeld} €`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Predstojeće u narednih 7 dana" description="Uplate, iseljenja i odluke.">
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink/50">Ništa ne zahteva pažnju.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((item) => (
                <li key={`${item.kind}-${item.stay.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {item.cabin.name} — {item.resident.firstName} {item.resident.lastName}
                    </p>
                    <p className="text-xs text-ink/50">{UPCOMING_LABEL[item.kind]} · {item.date}</p>
                  </div>
                  <Link href="/admin/residence/upcoming" className="shrink-0 rounded-full bg-wood/10 px-2.5 py-1 text-xs font-semibold text-wood hover:bg-wood/20">
                    {item.daysRemaining <= 0 ? "Danas/isteklo" : `${item.daysRemaining}d`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Nedavna aktivnost">
          {activity.length === 0 ? (
            <p className="text-sm text-ink/50">Još nema zabeleženih radnji.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activity.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="text-ink/80">{entry.summary}</p>
                  <p className="text-xs text-ink/40">{new Date(entry.at).toLocaleString("sr-RS")}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/70 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
