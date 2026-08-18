"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
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
      width: 200,
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
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- small dynamically-generated data: URL, not an optimizable static asset */}
      <img src={dataUrl} alt="" width={52} height={52} className="h-[3.25rem] w-[3.25rem] shrink-0 rounded-lg bg-white p-1.5 shadow-soft" />
      {label && <span className="max-w-[9rem] text-[0.65rem] leading-snug text-ink/50">{label}</span>}
    </div>
  );
}
