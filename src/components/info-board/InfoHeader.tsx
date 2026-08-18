import Image from "next/image";
import { Clock } from "./Clock";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function InfoHeader({ now, locale }: { now: Date; locale: BoardLocale }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/images/brand/icon-mark.png"
          alt=""
          width={40}
          height={40}
          priority
          className="h-8 w-8 sm:h-9 sm:w-9"
        />
        <span className="text-lg font-bold tracking-tight text-ink sm:text-xl">BJ Residence</span>
      </div>
      <Clock now={now} locale={locale} />
    </div>
  );
}
