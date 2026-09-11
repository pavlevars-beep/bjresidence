import Image from "next/image";
import { Clock } from "./Clock";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function InfoHeader({ now, locale }: { now: Date; locale: BoardLocale }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/images/brand/icon-mark.png"
          alt=""
          width={72}
          height={72}
          priority
          className="h-14 w-14 sm:h-16 sm:w-16"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-tight text-ink">BJ Residence</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wood sm:text-sm">
            Vaš prostor, vaš mir
          </span>
        </div>
      </div>
      <Clock now={now} locale={locale} />
    </div>
  );
}
