"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Eye } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { WifiConfig } from "@/lib/info-point";

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
    } catch {
      // clipboard unavailable — nothing to fall back to reliably, fail silently.
    }
  }
  return { copiedKey, copy };
}

export function WifiSection({ wifi }: { wifi: WifiConfig }) {
  const { dict } = useInfoPointLanguage();
  const { copiedKey, copy } = useCopy();
  const [revealed, setRevealed] = useState(wifi.revealMode === "visible");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!wifi.showQr || !wifi.password) {
      setQrDataUrl(null);
      return;
    }
    const escape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
    const payload = `WIFI:T:WPA;S:${escape(wifi.networkName)};P:${escape(wifi.password)};;`;
    let cancelled = false;
    QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: "#1E1F1C", light: "#FFFFFF" } })
      .then((url) => !cancelled && setQrDataUrl(url))
      .catch(() => !cancelled && setQrDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [wifi.showQr, wifi.password, wifi.networkName]);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-ink/8 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{dict.wifi.network}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-ink">{wifi.networkName}</p>
          <button
            type="button"
            onClick={() => copy("network", wifi.networkName)}
            className="flex items-center gap-1.5 rounded-full bg-olive-dark/10 px-3 py-1.5 text-sm font-medium text-olive-dark"
          >
            {copiedKey === "network" ? <Check size={15} /> : <Copy size={15} />}
            {copiedKey === "network" ? dict.common.copied : dict.common.copy}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/8 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{dict.wifi.password}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-lg font-bold tracking-wide text-ink">
            {revealed ? wifi.password || "—" : "•".repeat(Math.max(wifi.password.length, 8))}
          </p>
          {revealed ? (
            <button
              type="button"
              onClick={() => copy("password", wifi.password)}
              className="flex items-center gap-1.5 rounded-full bg-olive-dark/10 px-3 py-1.5 text-sm font-medium text-olive-dark"
            >
              {copiedKey === "password" ? <Check size={15} /> : <Copy size={15} />}
              {copiedKey === "password" ? dict.common.copied : dict.common.copy}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex items-center gap-1.5 rounded-full bg-olive-dark/10 px-3 py-1.5 text-sm font-medium text-olive-dark"
            >
              <Eye size={15} /> {dict.wifi.revealPassword}
            </button>
          )}
        </div>
      </div>

      {qrDataUrl && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-ink/8 bg-white p-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- small dynamically-generated data: URL */}
          <img src={qrDataUrl} alt="Wi-Fi QR" width={180} height={180} className="h-[11.25rem] w-[11.25rem]" />
          <p className="text-sm text-ink/50">{dict.wifi.scanToConnect}</p>
        </div>
      )}
    </div>
  );
}
