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
        <SprayCan size={28} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[clamp(1.2rem,1.1vw+1.4vh,2.1rem)] font-bold leading-tight tracking-tight text-ink">
          {formatFullDate(cleaning.date, locale)}
        </p>
        <p className="mt-1.5 text-[clamp(1.05rem,0.9vw+1vh,1.6rem)] font-semibold text-olive-dark">
          {cleaning.startTime}–{cleaning.endTime}
        </p>
        {note && <p className="mt-2 line-clamp-2 text-sm text-ink/60 sm:text-base">{note}</p>}
      </div>
    </BoardCard>
  );
}
