import { AlertTriangle } from "lucide-react";
import type { Announcement } from "@/lib/info-board";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function AnnouncementCard({ announcement, locale }: { announcement: Announcement; locale: BoardLocale }) {
  const title = locale === "sr" ? announcement.titleSr : announcement.titleEn;
  const text = locale === "sr" ? announcement.textSr : announcement.textEn;

  return (
    <div className="flex items-center gap-4 rounded-[1.75rem] border border-wood/25 bg-wood/10 px-6 py-4 shadow-soft sm:gap-5 sm:px-7 sm:py-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wood/20 text-wood">
        <AlertTriangle size={24} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        {title && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wood">{title}</p>}
        <p className="truncate text-xl font-medium leading-snug text-ink sm:text-2xl">{text}</p>
      </div>
    </div>
  );
}
