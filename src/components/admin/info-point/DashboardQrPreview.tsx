"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { generateQrPngDataUrl, getInfoPointUrl } from "./qr-utils";

export function DashboardQrPreview() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = getInfoPointUrl();

  useEffect(() => {
    generateQrPngDataUrl(url, { size: 220 }).then(setQrDataUrl);
  }, [url]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-white p-1.5">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamically generated data: URL
          <img src={qrDataUrl} alt="Info Point QR" className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{url}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-1.5 flex items-center gap-1.5 rounded-full bg-olive-dark/10 px-3 py-1.5 text-xs font-semibold text-olive-dark"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Kopirano" : "Kopiraj URL"}
        </button>
      </div>
    </div>
  );
}
