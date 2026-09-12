"use client";

import { Navigation } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { WorkDestination } from "@/lib/info-point";

export function WorkDestinationsSection({ destinations }: { destinations: WorkDestination[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const visible = destinations.filter((d) => d.enabled).sort((a, b) => a.order - b.order);

  if (visible.length === 0) {
    return <p className="py-6 text-center text-sm text-ink/40">{dict.workDestinations.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((dest) => {
        const instructions = locale === "sr" ? dest.instructionsSr : dest.instructionsEn;
        return (
          <div key={dest.id} className="rounded-2xl border border-ink/8 bg-white p-4">
            <p className="font-semibold text-ink">{dest.companyName}</p>
            {dest.address && <p className="mt-0.5 text-sm text-ink/50">{dest.address}</p>}
            {instructions && <p className="mt-2 text-sm leading-relaxed text-ink/65">{instructions}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/45">
              {dest.transportMode && <span>{dest.transportMode}</span>}
              {dest.estimatedMinutes != null && (
                <span>
                  {dict.workDestinations.estimatedTime}: {dest.estimatedMinutes} min
                </span>
              )}
            </div>
            {dest.notes && <p className="mt-2 text-sm text-ink/55">{dest.notes}</p>}
            {dest.mapsUrl && (
              <a
                href={dest.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-olive-dark px-3 py-1.5 text-sm font-medium text-cream"
              >
                <Navigation size={14} /> {dict.common.directions}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
