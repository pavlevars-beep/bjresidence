import { Cloud, Sunrise, Wind } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
import { getWeatherInfo } from "@/lib/weather-codes";
import { getAqiLevel } from "@/lib/aqi-levels";
import type { WeatherState } from "@/lib/info-board-client-types";
import type { InfoBoardDictionary } from "@/i18n/info-board-dictionary";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function WeatherCard({
  weather,
  locale,
  dict,
}: {
  weather: WeatherState | null;
  locale: BoardLocale;
  dict: InfoBoardDictionary;
}) {
  const info = weather ? getWeatherInfo(weather.current.code, weather.current.isDay) : null;
  const Icon = info?.icon ?? Cloud;
  const aqiLevel = weather?.current.aqi != null ? getAqiLevel(weather.current.aqi) : null;

  return (
    <BoardCard tone="dark" className="h-full">
      <BoardCardTitle tone="dark">{dict.weather.location}</BoardCardTitle>

      <div className="flex flex-1 flex-col justify-center">
        {weather ? (
          <>
            <div className="flex items-center gap-3">
              <Icon
                className="h-[clamp(3.25rem,3.5vw+4.5vh,5.5rem)] w-[clamp(3.25rem,3.5vw+4.5vh,5.5rem)] shrink-0 text-cream"
                strokeWidth={1.3}
              />
              <span className="text-[clamp(3.25rem,3.5vw+4.5vh,7rem)] font-bold leading-none tracking-tight text-cream">
                {weather.current.temp}°
              </span>
              {weather.current.feelsLike != null && (
                <span className="text-sm text-cream/60">
                  {dict.weather.feelsLike}
                  <br />
                  {weather.current.feelsLike}°
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-lg text-cream/80 sm:text-xl">{locale === "sr" ? info?.sr : info?.en}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-cream/15 pt-1.5 text-sm text-cream/70">
              <p>
                {dict.weather.today}{" "}
                <span className="font-semibold text-cream">
                  {weather.today.min}° / {weather.today.max}°
                </span>
              </p>
              {weather.tomorrow && (
                <p className="text-cream/50">
                  {dict.weather.tomorrow} {weather.tomorrow.min}° / {weather.tomorrow.max}°
                </p>
              )}
              {(weather.today.sunrise || weather.today.sunset) && (
                <span className="flex items-center gap-1.5">
                  <Sunrise
                    className="h-[clamp(0.95rem,1vw+1vh,1.35rem)] w-[clamp(0.95rem,1vw+1vh,1.35rem)] text-wood"
                    strokeWidth={1.8}
                  />
                  {weather.today.sunrise}
                  {weather.today.sunrise && weather.today.sunset && "–"}
                  {weather.today.sunset}
                </span>
              )}
              {aqiLevel && (
                <span className="flex items-center gap-1.5">
                  <Wind
                    className="h-[clamp(0.95rem,1vw+1vh,1.35rem)] w-[clamp(0.95rem,1vw+1vh,1.35rem)]"
                    style={{ color: aqiLevel.color }}
                    strokeWidth={1.8}
                  />
                  {dict.weather.airQuality}: {locale === "sr" ? aqiLevel.sr : aqiLevel.en}
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-base text-cream/50">{dict.weather.unavailable}</p>
        )}
      </div>
    </BoardCard>
  );
}
