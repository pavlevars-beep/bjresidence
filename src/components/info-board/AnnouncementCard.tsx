import { AlertTriangle } from "lucide-react";
import type { Announcement } from "@/lib/info-board";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function AnnouncementCard({ announcement, locale }: { announcement: Announcement; locale: BoardLocale }) {
  const title = locale === "sr" ? announcement.titleSr : announcement.titleEn;
  const text = locale === "sr" ? announcement.textSr : announcement.textEn;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-wood/25 bg-wood/10 px-4 py-3 shadow-soft sm:gap-4 sm:px-5 sm:py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wood/20 text-wood">
        <AlertTriangle size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        {title && <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-wood">{title}</p>}
        <p className="truncate text-base font-medium leading-snug text-ink sm:text-lg">{text}</p>
      </div>
    </div>
  );
}
