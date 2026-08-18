import { formatBoardDate, formatBoardTime } from "@/lib/board-format";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function Clock({ now, locale }: { now: Date; locale: BoardLocale }) {
  return (
    <div className="text-right">
      <p className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-none tracking-tight text-ink">
        {formatBoardTime(now)}
      </p>
      <p className="mt-0.5 text-xs font-medium text-ink/60 sm:text-sm">{formatBoardDate(now, locale)}</p>
    </div>
  );
}
