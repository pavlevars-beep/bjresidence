import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Braće Jerković, Beograd (Voždovac).
const LAT = 44.7614;
const LON = 20.4894;

/**
 * Weather for the /info kiosk board via Open-Meteo — free, no API key required,
 * so there is nothing secret to keep server-side-only; we still proxy through
 * our own route so the client only ever talks to same-origin endpoints and we
 * can centralize caching/fallback behaviour.
 */
export async function GET() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,weather_code,is_day,apparent_temperature` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset` +
    `&timezone=Europe%2FBelgrade&forecast_days=2`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();

    const currentTemp = data?.current?.temperature_2m;
    const todayMax = data?.daily?.temperature_2m_max?.[0];
    const todayMin = data?.daily?.temperature_2m_min?.[0];

    if (typeof currentTemp !== "number" || typeof todayMax !== "number" || typeof todayMin !== "number") {
      throw new Error("malformed payload");
    }

    const hasTomorrow = Array.isArray(data.daily.temperature_2m_max) && data.daily.temperature_2m_max.length > 1;

    // Sunrise/sunset come back as local ISO strings ("2026-08-19T05:45") since we
    // requested timezone=Europe/Belgrade — just lift the HH:mm, no conversion needed.
    const timeOnly = (iso: unknown) => (typeof iso === "string" ? iso.slice(11, 16) : null);

    return NextResponse.json({
      ok: true,
      current: {
        temp: Math.round(currentTemp),
        code: data.current.weather_code as number,
        isDay: data.current.is_day === 1,
        feelsLike:
          typeof data.current.apparent_temperature === "number"
            ? Math.round(data.current.apparent_temperature)
            : null,
      },
      today: {
        min: Math.round(todayMin),
        max: Math.round(todayMax),
        sunrise: timeOnly(data.daily.sunrise?.[0]),
        sunset: timeOnly(data.daily.sunset?.[0]),
      },
      tomorrow: hasTomorrow
        ? {
            min: Math.round(data.daily.temperature_2m_min[1]),
            max: Math.round(data.daily.temperature_2m_max[1]),
            code: data.daily.weather_code[1] as number,
          }
        : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[info-board/weather] fetch failed:", err);
    return NextResponse.json({ ok: false });
  }
}
