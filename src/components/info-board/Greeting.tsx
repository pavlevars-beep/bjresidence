import { getBelgradeHour } from "@/lib/board-format";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";

export function Greeting({ now, dict }: { now: Date; dict: InfoBoardDictionary }) {
  const hour = getBelgradeHour(now);
  const text = hour < 12 ? dict.greeting.morning : hour < 18 ? dict.greeting.afternoon : dict.greeting.evening;

  return (
    <div className="flex items-baseline gap-4">
      <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-tight text-ink">{text}</h1>
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-wood sm:text-base">
        {dict.greeting.welcome}
      </span>
    </div>
  );
}
