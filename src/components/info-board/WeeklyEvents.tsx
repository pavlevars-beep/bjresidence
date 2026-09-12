import { CalendarDays } from "lucide-react";
import { BoardCardTitle } from "./BoardCard";
import { formatShortDate } from "@/lib/board-format";
import type { WeeklyItem } from "@/lib/info-board";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

const MAX_ITEMS = 4;

export function WeeklyEvents({
  items,
  locale,
  dict,
}: {
  items: WeeklyItem[];
  locale: BoardLocale;
  dict: InfoBoardDictionary;
}) {
  const visible = [...items]
    .sort((a, b) => a.priority - b.priority || a.date.localeCompare(b.date))
    .slice(0, MAX_ITEMS);

  return (
    <div className="flex items-center gap-6 overflow-hidden rounded-[2rem] border border-ink/8 bg-white/70 p-4 shadow-soft sm:p-5">
      <div className="flex shrink-0 items-center gap-2.5">
        <CalendarDays size={24} className="text-olive-dark" strokeWidth={1.6} />
        <BoardCardTitle>{dict.weekly.title}</BoardCardTitle>
      </div>

      <ul className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
        {visible.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="shrink-0 rounded-full bg-olive-dark/10 px-3 py-1.5 text-sm font-semibold text-olive-dark">
              {formatShortDate(item.date, locale)}
            </span>
            <span className="truncate text-lg font-medium text-ink">
              {locale === "sr" ? item.titleSr : item.titleEn}
              {item.time && <span className="ml-2 font-normal text-ink/50">{item.time}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
