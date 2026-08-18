import { SprayCan } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
import { formatFullDate } from "@/lib/board-format";
import type { CleaningInfo } from "@/lib/info-board";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function CleaningCard({
  cleaning,
  locale,
  dict,
}: {
  cleaning: CleaningInfo;
  locale: BoardLocale;
  dict: InfoBoardDictionary;
}) {
  const note = locale === "sr" ? cleaning.noteSr : cleaning.noteEn;

  return (
    <BoardCard className="h-full">
      <div className="flex items-center justify-between gap-3">
        <BoardCardTitle>{dict.cleaning.title}</BoardCardTitle>
        <SprayCan size={22} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <p className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{formatFullDate(cleaning.date, locale)}</p>
        <p className="mt-1 text-lg font-semibold text-olive-dark">
          {cleaning.startTime}–{cleaning.endTime}
        </p>
        {note && <p className="mt-1.5 line-clamp-1 text-xs text-ink/60 sm:text-sm">{note}</p>}
      </div>
    </BoardCard>
  );
}
