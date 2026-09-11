import { Phone, Volume2, Wifi } from "lucide-react";
import type { ResidenceInfo as ResidenceInfoData } from "@/lib/info-board";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";

export function ResidenceInfo({ info, dict }: { info: ResidenceInfoData; dict: InfoBoardDictionary }) {
  const items = [
    info.wifiEnabled && { icon: Wifi, label: dict.residence.wifi, value: info.wifiName },
    info.quietHoursEnabled && { icon: Volume2, label: dict.residence.quietHours, value: info.quietHoursText },
    info.contactEnabled && { icon: Phone, label: dict.residence.contact, value: info.contactPhone },
  ].filter(Boolean) as { icon: typeof Wifi; label: string; value: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-2.5">
          <Icon size={22} className="shrink-0 text-wood" strokeWidth={1.8} />
          <span className="text-sm text-ink/50 sm:text-base">{label}</span>
          <span className="text-sm font-semibold text-ink sm:text-base">{value}</span>
        </div>
      ))}
    </div>
  );
}
