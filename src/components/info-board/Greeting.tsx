import { getBelgradeHour } from "@/lib/board-format";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";

export function Greeting({ now, dict }: { now: Date; dict: InfoBoardDictionary }) {
  const hour = getBelgradeHour(now);
  const text = hour < 12 ? dict.greeting.morning : hour < 18 ? dict.greeting.afternoon : dict.greeting.evening;

  return (
    <div className="flex items-baseline gap-3">
      <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{text}</h1>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-wood">{dict.greeting.welcome}</span>
    </div>
  );
}
