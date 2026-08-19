"use client";

import { MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import { PropertyMapSvg } from "@/components/PropertyMapSvg";

export function LocationAerial({ caption }: { caption: string }) {
  return (
    <a
      href={siteConfig.location.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-ink/10 shadow-soft transition-transform duration-300 hover:scale-[1.01]"
    >
      <PropertyMapSvg titleId="aerial-title" title={caption} />

      <div className="flex items-center gap-2 bg-white/70 px-4 py-3">
        <MapPin size={15} className="shrink-0 text-wood" />
        <p className="text-xs text-ink/70 sm:text-sm">{caption}</p>
      </div>
    </a>
  );
}
