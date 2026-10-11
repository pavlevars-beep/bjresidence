import Link from "next/link";
import type { CleaningDueItem } from "@/lib/residence/derive";

/** Posteljina/peškiri change every 15 days per the contract — computed, nothing here is stored as "done". */
export function CleaningScheduleList({ items }: { items: CleaningDueItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink/50">Nema aktivnih boravaka.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.stay.id}
          className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3.5 ${
            item.overdue ? "border-red-200 bg-red-50" : "border-ink/10 bg-white"
          }`}
        >
          <div>
            <Link href={`/admin/residence/residents/${item.resident.id}`} className="text-sm font-medium text-ink hover:underline">
              {item.cabin.name} — {item.resident.firstName} {item.resident.lastName}
            </Link>
            <p className="text-xs text-ink/50">Useljenje: {item.stay.moveInDate}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${item.overdue ? "text-red-700" : "text-ink"}`}>{item.dueDate}</p>
            <p className="text-xs text-ink/50">
              {item.overdue ? `kasni ${-item.daysRemaining} dana` : item.daysRemaining === 0 ? "danas" : `za ${item.daysRemaining} dana`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
