import { formatBoardDate, formatBoardTime } from "@/lib/board-format";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function Clock({ now, locale }: { now: Date; locale: BoardLocale }) {
  return (
    <div className="text-right">
      <p className="text-[clamp(3.5rem,8vw,7rem)] font-bold leading-none tracking-tight text-ink">
        {formatBoardTime(now)}
      </p>
      <p className="mt-1.5 text-[clamp(1.1rem,1.8vw,1.6rem)] font-medium text-ink/60">{formatBoardDate(now, locale)}</p>
    </div>
  );
}
