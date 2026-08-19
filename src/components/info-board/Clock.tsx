import { formatBoardDate, formatBoardTime } from "@/lib/board-format";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function Clock({ now, locale }: { now: Date; locale: BoardLocale }) {
  return (
    <div className="text-right">
      <p className="text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-none tracking-tight text-ink">
        {formatBoardTime(now)}
      </p>
      <p className="mt-1 text-base font-medium text-ink/60 sm:text-lg">{formatBoardDate(now, locale)}</p>
    </div>
  );
}
