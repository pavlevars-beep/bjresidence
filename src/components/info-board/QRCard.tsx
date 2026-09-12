"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ChevronRight } from "lucide-react";
import type { QrSettings } from "@/lib/info-board";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function QRCard({ qr, locale }: { qr: QrSettings; locale: BoardLocale }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!qr.enabled || !qr.url) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(qr.url, {
      width: 320,
      margin: 1,
      color: { dark: "#1E1F1C", light: "#00000000" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [qr.enabled, qr.url]);

  if (!qr.enabled || !qr.url || !dataUrl) return null;

  const label = locale === "sr" ? qr.labelSr : qr.labelEn;

  return (
    <Link
      href="/info-point?kiosk=1"
      className="flex items-center gap-3 rounded-2xl transition-transform active:scale-[0.97]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small dynamically-generated data: URL, not an optimizable static asset */}
      <img src={dataUrl} alt="" width={112} height={112} className="h-[7rem] w-[7rem] shrink-0 rounded-xl bg-white p-2 shadow-soft" />
      <span className="flex items-center gap-1">
        {label && <span className="max-w-[8.5rem] whitespace-pre-line text-xs leading-snug text-ink/50">{label}</span>}
        <ChevronRight size={16} className="shrink-0 text-ink/30" />
      </span>
    </Link>
  );
}
