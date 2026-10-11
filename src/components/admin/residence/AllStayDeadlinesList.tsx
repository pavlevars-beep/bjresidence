import Link from "next/link";
import { formatDateDisplay } from "@/lib/residence/date-math";
import type { StayDeadlines } from "@/lib/residence/derive";

function urgencyClass(days: number): string {
  if (days < 0) return "text-red-700";
  if (days <= 7) return "text-wood";
  return "text-ink/50";
}

/** Read-only, always-visible overview of every active stay's computed dates — not time-windowed like the "Potrebna pažnja" list above it. */
export function AllStayDeadlinesList({ items }: { items: StayDeadlines[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink/50">Nema aktivnih boravaka.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
            <th className="py-2 pr-3">Gost / Kabina</th>
            <th className="py-2 pr-3">Rok za najavu</th>
            <th className="py-2 pr-3">Kraj perioda</th>
            <th className="py-2 pr-3">Sledeća uplata</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.stay.id} className="border-b border-ink/5">
              <td className="py-2 pr-3">
                <Link href={`/admin/residence/residents/${item.resident.id}`} className="font-medium text-ink hover:underline">
                  {item.resident.firstName} {item.resident.lastName}
                </Link>
                <span className="ml-1 text-xs text-ink/45">({item.cabin.name})</span>
              </td>
              <td className={`py-2 pr-3 ${urgencyClass(item.daysToNoticeDeadline)}`}>
                {formatDateDisplay(item.noticeDeadline)}
                <span className="ml-1 text-xs">
                  ({item.daysToNoticeDeadline < 0 ? `prošao pre ${-item.daysToNoticeDeadline}d` : item.daysToNoticeDeadline === 0 ? "danas" : `za ${item.daysToNoticeDeadline}d`})
                </span>
              </td>
              <td className="py-2 pr-3 text-ink/70">{formatDateDisplay(item.periodEnd)}</td>
              <td className="py-2 pr-3 text-ink/70">{formatDateDisplay(item.nextPaymentDue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
