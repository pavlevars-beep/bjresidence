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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon size={18} className="shrink-0 text-wood" strokeWidth={1.8} />
          <span className="hidden text-xs text-ink/50 sm:text-sm xl:inline">{label}</span>
          <span className="text-xs font-semibold text-ink sm:text-sm">{value}</span>
        </div>
      ))}
    </div>
  );
}
