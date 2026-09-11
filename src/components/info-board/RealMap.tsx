"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

// Braće Jerković, Beograd — same coordinates used for the weather lookup.
const LAT = 44.7614;
const LON = 20.4894;

/**
 * Real OpenStreetMap tile view of the property, locked down for kiosk use
 * (no drag/zoom/tap) — this is a static "you are here" display, not an
 * interactive map, so nothing on it should be touchable.
 */
export function RealMap({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    import("leaflet")
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [LAT, LON],
          zoom: 16,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
        });

        // CARTO's free basemap (built on OpenStreetMap data, no API key) rather
        // than tile.openstreetmap.org directly — that raw tile server's usage
        // policy explicitly discourages embedding it in apps/products; CARTO's
        // is meant for exactly this and matches our muted color palette better.
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
            '&copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html:
            '<div style="width:18px;height:18px;border-radius:9999px;background:#A9784E;' +
            'border:3px solid #F7F4EE;box-shadow:0 2px 8px rgba(0,0,0,0.45)"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([LAT, LON], { icon }).addTo(map);

        mapRef.current = map;

        resizeObserver = new ResizeObserver(() => map.invalidateSize());
        resizeObserver.observe(containerRef.current);
      })
      .catch(() => {
        // Tiles/library failed to load (offline, blocked) — leave the area
        // empty rather than throwing; the rest of the board keeps working.
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-stone">
      <div ref={containerRef} className="h-full w-full [&_.leaflet-control-attribution]:!text-[9px]" />
      <span className="pointer-events-none absolute left-2 top-2 z-[1000] rounded-full bg-ink/60 px-2.5 py-1 text-xs font-medium text-cream backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
