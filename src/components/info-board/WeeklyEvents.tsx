import { CalendarDays } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
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
    <BoardCard className="h-full">
      <div className="flex items-center justify-between gap-3">
        <BoardCardTitle>{dict.weekly.title}</BoardCardTitle>
        <CalendarDays size={18} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-olive-dark/10 px-2.5 py-1 text-xs font-semibold text-olive-dark">
                {formatShortDate(item.date, locale)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink sm:text-base">
                  {locale === "sr" ? item.titleSr : item.titleEn}
                  {item.time && <span className="ml-2 font-normal text-ink/50">{item.time}</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </BoardCard>
  );
}
