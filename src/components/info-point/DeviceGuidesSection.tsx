"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PlayCircle, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { DeviceGuide } from "@/lib/info-point";

export function DeviceGuidesSection({ guides }: { guides: DeviceGuide[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = guides.filter((g) => g.enabled).sort((a, b) => a.order - b.order);
  const selected = visible.find((g) => g.id === selectedId) ?? null;

  if (selected) {
    const title = locale === "sr" ? selected.titleSr : selected.titleEn;
    const description = locale === "sr" ? selected.descriptionSr : selected.descriptionEn;
    const steps = locale === "sr" ? selected.stepsSr : selected.stepsEn;
    const warning = locale === "sr" ? selected.warningSr : selected.warningEn;

    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 self-start text-sm font-medium text-olive-dark"
        >
          <ChevronLeft size={16} /> {dict.common.back}
        </button>

        {selected.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone">
            <Image src={selected.image} alt={title} fill className="object-cover" />
          </div>
        )}

        <h3 className="text-xl font-bold text-ink">{title}</h3>
        {description && <p className="text-sm text-ink/65">{description}</p>}

        {steps.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">{dict.deviceGuides.steps}</p>
            <ol className="flex flex-col gap-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-ink/8 bg-white p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive-dark/10 text-xs font-bold text-olive-dark">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink/75">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {warning && (
          <div className="flex items-start gap-2.5 rounded-xl bg-wood/10 p-3.5 text-sm text-wood">
            <TriangleAlert size={17} className="mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {selected.videoUrl && (
          <a
            href={selected.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-medium text-ink hover:border-olive-dark hover:text-olive-dark"
          >
            <PlayCircle size={17} /> {dict.deviceGuides.watchVideo}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((guide) => {
        const title = locale === "sr" ? guide.titleSr : guide.titleEn;
        return (
          <button
            key={guide.id}
            type="button"
            onClick={() => setSelectedId(guide.id)}
            className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4 text-left"
          >
            <span className="min-w-0 flex-1 font-semibold text-ink">{title}</span>
            <ChevronRight size={18} className="shrink-0 text-ink/30" />
          </button>
        );
      })}
    </div>
  );
}
