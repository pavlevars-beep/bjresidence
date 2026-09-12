"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, MapIcon, Navigation, Phone as PhoneIcon, Star } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import { cn } from "@/lib/utils";
import type { NearbyPlace, NearbyPlaceCategory } from "@/lib/info-point";

const NearbyMap = dynamic(() => import("./NearbyMap").then((m) => m.NearbyMap), { ssr: false });

const FILTERS: ("all" | NearbyPlaceCategory)[] = ["all", "supermarket", "pharmacy", "atm", "health", "food", "other"];

export function NearbySection({ places }: { places: NearbyPlace[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const [filter, setFilter] = useState<"all" | NearbyPlaceCategory>("all");
  const [view, setView] = useState<"list" | "map">("list");

  const visible = useMemo(
    () =>
      places
        .filter((p) => p.visible)
        .filter((p) => filter === "all" || p.category === filter)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order),
    [places, filter]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f ? "bg-olive-dark text-cream" : "bg-ink/5 text-ink/60"
              )}
            >
              {dict.nearby.filters[f]}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 rounded-full border border-ink/10 bg-white p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn("rounded-full p-1.5", view === "list" ? "bg-olive-dark text-cream" : "text-ink/50")}
            aria-label={dict.nearby.list}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn("rounded-full p-1.5", view === "map" ? "bg-olive-dark text-cream" : "text-ink/50")}
            aria-label={dict.nearby.map}
          >
            <MapIcon size={16} />
          </button>
        </div>
      </div>

      {view === "map" && <NearbyMap places={visible} />}

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/40">{dict.nearby.noPlaces}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((place) => {
            const description = locale === "sr" ? place.descriptionSr : place.descriptionEn;
            return (
              <div key={place.id} className="rounded-2xl border border-ink/8 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-ink">{place.name}</p>
                      {place.featured && <Star size={13} className="shrink-0 fill-wood text-wood" />}
                    </div>
                    <p className="truncate text-sm text-ink/50">{place.address}</p>
                  </div>
                  {place.walkMinutes != null && (
                    <span className="shrink-0 rounded-full bg-olive-dark/10 px-2.5 py-1 text-xs font-semibold text-olive-dark">
                      {place.walkMinutes} {dict.common.minutesWalk}
                    </span>
                  )}
                </div>
                {description && <p className="mt-2 text-sm leading-relaxed text-ink/65">{description}</p>}
                {place.hours && <p className="mt-1.5 text-xs text-ink/45">{place.hours}</p>}
                <div className="mt-3 flex gap-2">
                  {place.mapsUrl && (
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-olive-dark px-3 py-2 text-sm font-medium text-cream"
                    >
                      <Navigation size={14} /> {dict.common.directions}
                    </a>
                  )}
                  {place.phone && (
                    <a
                      href={`tel:${place.phone.replace(/\s+/g, "")}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-3 py-2 text-sm font-medium text-ink"
                    >
                      <PhoneIcon size={14} /> {dict.common.call}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
