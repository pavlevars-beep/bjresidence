import { Car } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
import { RealMap } from "./RealMap";
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
        <Car size={28} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
      </div>

      <div className="mt-3 flex flex-1 gap-4">
        <div className="w-[24%] min-w-[64px] shrink-0">
          <RealMap label={dict.traffic.whereWeAre} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {destinations.length > 0 ? (
            <ul className="space-y-[clamp(0.4rem,1.5vh,1.1rem)]">
              {destinations.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span className="text-[clamp(0.9rem,1vw+0.7vh,1.3rem)] leading-tight text-ink/80">
                    {locale === "sr" ? d.nameSr : d.nameEn}
                  </span>
                  <span className="shrink-0 text-[clamp(0.9rem,1vw+0.7vh,1.3rem)] font-semibold text-ink">
                    {d.minutes != null ? `${d.minutes} ${dict.traffic.min}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-ink/40">{dict.traffic.unavailable}</p>
          )}
        </div>
      </div>
    </BoardCard>
  );
}
