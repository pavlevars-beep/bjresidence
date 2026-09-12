"use client";

import { Navigation, Phone as PhoneIcon, ExternalLink } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { TaxiOption, TransportRoute } from "@/lib/info-point";

export function TransportSection({ routes, taxiOptions }: { routes: TransportRoute[]; taxiOptions: TaxiOption[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const visibleRoutes = routes.filter((r) => r.enabled).sort((a, b) => a.order - b.order);
  const visibleTaxis = taxiOptions.filter((t) => t.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {visibleRoutes.map((route) => {
          const title = locale === "sr" ? route.titleSr : route.titleEn;
          const body = locale === "sr" ? route.bodySr : route.bodyEn;
          return (
            <div key={route.id} className="rounded-2xl border border-ink/8 bg-white p-4">
              <p className="font-semibold text-ink">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{body}</p>
              {route.mapsUrl && (
                <a
                  href={route.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-olive-dark/10 px-3 py-1.5 text-sm font-medium text-olive-dark"
                >
                  <Navigation size={14} /> {dict.common.openMaps}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {visibleTaxis.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{dict.transport.taxiTitle}</p>
          <div className="flex flex-col gap-3">
            {visibleTaxis.map((taxi) => (
              <div key={taxi.id} className="rounded-2xl border border-ink/8 bg-white p-4">
                <p className="font-semibold text-ink">{taxi.name}</p>
                {taxi.description && <p className="mt-1 text-sm text-ink/60">{taxi.description}</p>}
                <div className="mt-3 flex gap-2">
                  {taxi.phone && (
                    <a
                      href={`tel:${taxi.phone.replace(/\s+/g, "")}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-3 py-2 text-sm font-medium text-ink"
                    >
                      <PhoneIcon size={14} /> {dict.common.call}
                    </a>
                  )}
                  {taxi.url && (
                    <a
                      href={taxi.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-olive-dark px-3 py-2 text-sm font-medium text-cream"
                    >
                      <ExternalLink size={14} /> {dict.common.website}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink/40">{dict.transport.taxiTip}</p>
        </div>
      )}
    </div>
  );
}
