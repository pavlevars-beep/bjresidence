import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAvailability } from "@/lib/availability-store";
import { getResidenceStats, getUpcoming } from "@/lib/residence/derive";
import { SectionCard } from "@/components/admin/ui";
import { ADMIN_NAV_GROUPS } from "@/components/admin/AdminNavConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BJ Residence — Admin",
  robots: { index: false, follow: false },
};

const UPCOMING_LABEL: Record<string, string> = {
  decision_needed: "Odluka o nastavku",
  payment_due: "Uplata dospeva",
  move_out: "Očekivano iseljenje",
};

export default async function AdminHomePage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [availability, stats, upcoming] = await Promise.all([getAvailability(), getResidenceStats(), getUpcoming(7)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Kontrolna tabla</h1>
        <p className="mt-1 text-sm text-ink/55">Brz pregled sajta i smeštaja.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Dostupno na sajtu" value={`${availability.freeSpots} / ${availability.totalSpots}`} hint={availability.overrideEnabled ? "Ručno podešeno" : "Automatski"} />
        <StatTile label="Zauzeto" value={String(stats.occupied)} />
        <StatTile label="Mesečni prihod" value={`${stats.monthlyRecurringRent} €`} />
        <StatTile label="Depoziti na čuvanju" value={`${stats.depositsHeld} €`} />
      </div>

      <SectionCard
        title="Predstojeće u narednih 7 dana"
        description="Uplate, iseljenja i odluke koje treba doneti."
        headerRight={
          <Link href="/admin/residence/upcoming" className="flex items-center gap-1 text-sm font-medium text-olive-dark hover:underline">
            Sve <ArrowRight size={14} />
          </Link>
        }
      >
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink/50">Ništa ne zahteva pažnju u narednih 7 dana.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.slice(0, 5).map((item) => (
              <li key={`${item.kind}-${item.stay.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {item.cabin.name} — {item.resident.firstName} {item.resident.lastName}
                  </p>
                  <p className="text-xs text-ink/50">{UPCOMING_LABEL[item.kind]} · {item.date}</p>
                </div>
                <span className="shrink-0 rounded-full bg-wood/10 px-2.5 py-1 text-xs font-semibold text-wood">
                  {item.daysRemaining <= 0 ? "Danas/isteklo" : `${item.daysRemaining}d`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {ADMIN_NAV_GROUPS.map((group) => (
          <SectionCard key={group.label} title={group.label}>
            <div className="flex flex-wrap gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-ink/5 px-3 py-1.5 text-sm font-medium text-ink/70 hover:bg-ink/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/70 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
