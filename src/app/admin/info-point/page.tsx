import Link from "next/link";
import { ExternalLink, Settings } from "lucide-react";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { getIssueReports } from "@/lib/info-point-issues-store";
import { SectionCard } from "@/components/admin/ui";
import { DashboardQrPreview } from "@/components/admin/info-point/DashboardQrPreview";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-ink/50">{label}</p>
    </div>
  );
}

export default async function InfoPointDashboardPage() {
  const [config, issues] = await Promise.all([getInfoPointConfig(), getIssueReports()]);
  const enabledCategories = config.categories.filter((c) => c.enabled).length;
  const openIssues = issues.filter((i) => i.status !== "resolved").length;

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Info Point"
        description={`${enabledCategories} od ${config.categories.length} modula je uključeno.`}
        headerRight={
          <Link
            href="/info-point"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-medium text-cream"
          >
            <ExternalLink size={15} /> Preview Info Point
          </Link>
        }
      >
        <DashboardQrPreview />
      </SectionCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Lokacije u blizini" value={config.nearbyPlaces.length} />
        <StatCard label="Uputstva za uređaje" value={config.deviceGuides.length} />
        <StatCard label="Destinacije za posao" value={config.workDestinations.length} />
        <StatCard label="Otvorene prijave kvara" value={openIssues} />
      </div>

      <SectionCard title="Upravljanje sadržajem" description="Brzi pristup najčešće menjanim sekcijama.">
        <div className="flex flex-wrap gap-2.5">
          {[
            { href: "/admin/info-point/general", label: "General" },
            { href: "/admin/info-point/wifi", label: "Wi-Fi" },
            { href: "/admin/info-point/nearby-places", label: "Nearby Places" },
            { href: "/admin/info-point/issue-reports", label: "Issue Reports" },
            { href: "/admin/info-point/qr-codes", label: "QR Codes" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-sm font-medium text-ink hover:border-olive-dark hover:text-olive-dark"
            >
              <Settings size={14} /> {item.label}
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
