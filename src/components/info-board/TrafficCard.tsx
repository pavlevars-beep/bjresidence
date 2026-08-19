import { Car } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
import { PropertyMapSvg } from "@/components/PropertyMapSvg";
import type { TrafficState } from "@/lib/info-board-client-types";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function TrafficCard({
  traffic,
  locale,
  dict,
}: {
  traffic: TrafficState | null;
  locale: BoardLocale;
  dict: InfoBoardDictionary;
}) {
  const destinations = traffic?.destinations ?? [];

  return (
    <BoardCard className="h-full">
      <div className="flex items-center justify-between gap-3">
        <BoardCardTitle>{dict.traffic.title}</BoardCardTitle>
        <Car size={18} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
      </div>

      <div className="mt-2.5 flex flex-1 gap-3">
        <div className="relative w-[26%] min-w-[70px] shrink-0 overflow-hidden rounded-xl">
          <PropertyMapSvg titleId="board-map-title" title={dict.traffic.whereWeAre} className="block h-full w-full object-cover" />
          <span className="absolute bottom-1 left-1 rounded-full bg-ink/60 px-1.5 py-0.5 text-[0.55rem] font-medium text-cream backdrop-blur-sm">
            {dict.traffic.whereWeAre}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {destinations.length > 0 ? (
            <ul className="space-y-3">
              {destinations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-ink/80 sm:text-base">
                    {locale === "sr" ? d.nameSr : d.nameEn}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-ink sm:text-base">
                    {d.minutes != null ? `${d.minutes} ${dict.traffic.min}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/40">{dict.traffic.unavailable}</p>
          )}
        </div>
      </div>
    </BoardCard>
  );
}
