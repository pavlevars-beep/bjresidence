"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { SectionCard } from "../ui";
import {
  composeBrandedPng,
  downloadDataUrl,
  downloadTextFile,
  generateQrPngDataUrl,
  generateQrSvgString,
  getInfoPointUrl,
} from "./qr-utils";

type Preset = "standard" | "inverted";

export function QrCodesPanel() {
  const url = useMemo(() => getInfoPointUrl(), []);
  const [preset, setPreset] = useState<Preset>("standard");
  const [transparent, setTransparent] = useState(false);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);

  const dark = preset === "standard" ? "#1E1F1C" : "#F7F4EE";
  const light = transparent ? "#00000000" : preset === "standard" ? "#FFFFFF" : "#1E1F1C";

  useEffect(() => {
    let cancelled = false;
    generateQrPngDataUrl(url, { dark, light, size: 480 }).then((dataUrl) => {
      if (!cancelled) setPngDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url, dark, light]);

  async function handleDownloadPng() {
    const dataUrl = await generateQrPngDataUrl(url, { dark, light, size: 1024 });
    downloadDataUrl(dataUrl, "bj-residence-info-point-qr.png");
  }

  async function handleDownloadSvg() {
    const svg = await generateQrSvgString(url, { dark, light });
    downloadTextFile(svg, "bj-residence-info-point-qr.svg", "image/svg+xml");
  }

  async function handleDownloadBranded() {
    const qrDataUrl = await generateQrPngDataUrl(url, { dark: "#1E1F1C", light: "#FFFFFF", size: 480 });
    const brandedPng = await composeBrandedPng({
      qrDataUrl,
      captionLine1: "Skenirajte za sve informacije",
      captionLine2: "Scan for resident information",
    });
    downloadDataUrl(brandedPng, "bj-residence-info-point-qr-branded.png");
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="QR kod" description={`Vodi na: ${url}`}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div
            className={`flex h-56 w-56 shrink-0 items-center justify-center rounded-2xl border border-ink/10 bg-[length:16px_16px] p-4 ${
              preset === "inverted"
                ? "bg-[conic-gradient(#2a2b27_25%,#1e1f1c_0_50%,#2a2b27_0_75%,#1e1f1c_0)]"
                : "bg-[conic-gradient(#f7f4ee_25%,#eee9df_0_50%,#f7f4ee_0_75%,#eee9df_0)]"
            }`}
          >
            {pngDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- dynamically generated data: URL
              <img src={pngDataUrl} alt="Info Point QR" className="h-full w-full" />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Varijanta</span>
                <div className="flex overflow-hidden rounded-xl border border-ink/15">
                  <button
                    type="button"
                    onClick={() => setPreset("standard")}
                    className={`px-3 py-1.5 text-sm font-medium ${preset === "standard" ? "bg-olive-dark text-cream" : "bg-white text-ink/60"}`}
                  >
                    Svetla
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset("inverted")}
                    className={`px-3 py-1.5 text-sm font-medium ${preset === "inverted" ? "bg-olive-dark text-cream" : "bg-white text-ink/60"}`}
                  >
                    Tamna
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Pozadina</span>
                <div className="flex overflow-hidden rounded-xl border border-ink/15">
                  <button
                    type="button"
                    onClick={() => setTransparent(false)}
                    className={`px-3 py-1.5 text-sm font-medium ${!transparent ? "bg-olive-dark text-cream" : "bg-white text-ink/60"}`}
                  >
                    Puna
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransparent(true)}
                    className={`px-3 py-1.5 text-sm font-medium ${transparent ? "bg-olive-dark text-cream" : "bg-white text-ink/60"}`}
                  >
                    Providna
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2.5 text-sm font-medium text-cream"
              >
                <Download size={15} /> PNG (obično)
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink"
              >
                <Download size={15} /> SVG (obično)
              </button>
              <button
                type="button"
                onClick={handleDownloadBranded}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink"
              >
                <Download size={15} /> PNG (BJ Residence brend)
              </button>
              <Link
                href="/admin/info-point-print"
                target="_blank"
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink"
              >
                <Printer size={15} /> Kartica za štampu (A6)
              </Link>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
