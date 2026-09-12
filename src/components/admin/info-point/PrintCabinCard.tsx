"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer } from "lucide-react";
import { generateQrPngDataUrl, getInfoPointUrl } from "./qr-utils";

export function PrintCabinCard() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQrPngDataUrl(getInfoPointUrl(), { dark: "#1E1F1C", light: "#FFFFFF", size: 640 }).then(setQrDataUrl);
  }, []);

  return (
    <div className="min-h-screen bg-stone/40 py-10 print:bg-white print:py-0">
      <button
        type="button"
        onClick={() => window.print()}
        className="mx-auto mb-6 flex items-center gap-2 rounded-full bg-olive-dark px-5 py-2.5 text-sm font-semibold text-cream print:hidden"
      >
        <Printer size={16} /> Print / Save as PDF
      </button>

      {/* A6 ≈ 105mm x 148mm */}
      <div
        className="mx-auto flex flex-col items-center justify-between rounded-[1.5rem] border border-ink/10 bg-cream p-8 text-center shadow-card print:m-0 print:rounded-none print:border-0 print:shadow-none"
        style={{ width: "105mm", minHeight: "148mm" }}
      >
        <Image src="/images/brand/icon-mark.png" alt="" width={56} height={56} className="h-14 w-14" />

        <div>
          <p className="text-2xl font-bold tracking-tight text-ink">Living at BJ</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-wood">Info Point</p>
        </div>

        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- dynamically generated data: URL, printed at fixed physical size
          <img src={qrDataUrl} alt="Info Point QR" className="h-40 w-40" />
        )}

        <div className="flex flex-col gap-3 text-sm leading-snug text-ink/70">
          <p>
            Skenirajte za:
            <br />
            <span className="font-medium text-ink">Wi-Fi • kućni red • prijavu kvara • prevoz • korisne informacije</span>
          </p>
          <p className="border-t border-ink/10 pt-3 text-ink/60">
            Scan for:
            <br />
            <span className="font-medium text-ink">Wi-Fi • house rules • issue reporting • transport • useful information</span>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 105mm 148mm;
            margin: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
