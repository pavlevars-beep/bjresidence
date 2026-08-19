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
          width={48}
          height={48}
          priority
          className="h-10 w-10 sm:h-12 sm:w-12"
        />
        <span className="text-xl font-bold tracking-tight text-ink sm:text-2xl">BJ Residence</span>
      </div>
      <Clock now={now} locale={locale} />
    </div>
  );
}
