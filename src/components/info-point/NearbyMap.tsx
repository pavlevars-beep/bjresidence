"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import type { NearbyPlace } from "@/lib/info-point";

const BJ_LAT = 44.7614;
const BJ_LON = 20.4894;

/**
 * Explorable map for the Nearby section — unlike the kiosk's locked-down
 * RealMap (info-board/RealMap.tsx), this one is meant to be panned/zoomed by
 * a resident on their own phone, so normal touch interaction stays enabled.
 * Only places with confirmed lat/lng get a pin; others still show in the list
 * with a Directions deep link (see info-point.ts's note on unverified coordinates).
 */
export function NearbyMap({ places }: { places: NearbyPlace[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { center: [BJ_LAT, BJ_LON], zoom: 15 });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const homeIcon = L.divIcon({
        className: "",
        html:
          '<div style="width:20px;height:20px;border-radius:9999px;background:#59624F;' +
          'border:3px solid #F7F4EE;box-shadow:0 2px 8px rgba(0,0,0,0.45)"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([BJ_LAT, BJ_LON], { icon: homeIcon }).addTo(map);

      const placeIcon = L.divIcon({
        className: "",
        html:
          '<div style="width:14px;height:14px;border-radius:9999px;background:#A9784E;' +
          'border:2px solid #F7F4EE;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      places
        .filter((p) => p.lat != null && p.lng != null)
        .forEach((p) => {
          L.marker([p.lat as number, p.lng as number], { icon: placeIcon }).addTo(map).bindPopup(p.name);
        });

      mapRef.current = map;
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(containerRef.current);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markers are set up once at mount; the place list is static per sheet-open
  }, []);

  return <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-2xl bg-stone" />;
}
