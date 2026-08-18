import { NextResponse } from "next/server";
import { getInfoBoardConfig } from "@/lib/info-board-store";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/**
 * Travel times for the /info kiosk board. If GOOGLE_MAPS_API_KEY is configured,
 * fetches live traffic-aware durations from the Distance Matrix API (server-side
 * only — the key is never sent to the client). Otherwise — or if that call fails
 * — falls back to the static per-destination estimate set in /admin, so the
 * card always has something reasonable to show instead of an error.
 */
export async function GET() {
  const config = await getInfoBoardConfig();
  const destinations = config.trafficDestinations.filter((d) => d.enabled).sort((a, b) => a.order - b.order);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  let liveMinutes: Array<number | null> = destinations.map(() => null);

  if (apiKey && destinations.length > 0) {
    try {
      const origin = encodeURIComponent(siteConfig.location.address);
      const dest = destinations.map((d) => encodeURIComponent(d.destination)).join("|");
      const url =
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}` +
        `&destinations=${dest}&departure_time=now&key=${apiKey}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(6000), cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const elements = data?.rows?.[0]?.elements;
        if (Array.isArray(elements)) {
          liveMinutes = elements.map((el: { status?: string; duration_in_traffic?: { value?: number }; duration?: { value?: number } }) => {
            if (el?.status !== "OK") return null;
            const seconds = el.duration_in_traffic?.value ?? el.duration?.value;
            return typeof seconds === "number" ? Math.round(seconds / 60) : null;
          });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[info-board/traffic] live fetch failed:", err);
    }
  }

  const results = destinations.map((d, i) => ({
    id: d.id,
    nameSr: d.nameSr,
    nameEn: d.nameEn,
    minutes: liveMinutes[i] ?? d.fallbackMinutes,
    live: liveMinutes[i] != null,
  }));

  return NextResponse.json({ ok: true, destinations: results, updatedAt: new Date().toISOString() });
}
