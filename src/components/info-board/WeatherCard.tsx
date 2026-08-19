import { Cloud, Sunrise, Sunset } from "lucide-react";
import { BoardCard, BoardCardTitle } from "./BoardCard";
import { getWeatherInfo } from "@/lib/weather-codes";
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

  return (
    <BoardCard className="h-full">
      <BoardCardTitle>{dict.weather.location}</BoardCardTitle>

      <div className="flex flex-1 flex-col justify-center">
        {weather ? (
          <>
            <div className="flex items-center gap-3">
              <Icon size={44} className="shrink-0 text-olive-dark" strokeWidth={1.6} />
              <span className="text-[clamp(2.5rem,5.5vw,3.75rem)] font-bold leading-none tracking-tight text-ink">
                {weather.current.temp}°
              </span>
              {weather.current.feelsLike != null && (
                <span className="text-sm text-ink/50">
                  {dict.weather.feelsLike} {weather.current.feelsLike}°
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-base text-ink/70">{locale === "sr" ? info?.sr : info?.en}</p>

            <div className="mt-3 flex items-center gap-3 border-t border-ink/8 pt-2 text-xs text-ink/60 sm:text-sm">
              <p>
                {dict.weather.today}{" "}
                <span className="font-semibold text-ink">
                  {weather.today.min}° / {weather.today.max}°
                </span>
              </p>
              {weather.tomorrow && (
                <p className="text-ink/45">
                  {dict.weather.tomorrow} {weather.tomorrow.min}° / {weather.tomorrow.max}°
                </p>
              )}
            </div>

            {(weather.today.sunrise || weather.today.sunset) && (
              <div className="mt-2 flex items-center gap-4 text-xs text-ink/50 sm:text-sm">
                {weather.today.sunrise && (
                  <span className="flex items-center gap-1.5">
                    <Sunrise size={15} className="text-wood" strokeWidth={1.8} />
                    {weather.today.sunrise}
                  </span>
                )}
                {weather.today.sunset && (
                  <span className="flex items-center gap-1.5">
                    <Sunset size={15} className="text-wood" strokeWidth={1.8} />
                    {weather.today.sunset}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-ink/40">{dict.weather.unavailable}</p>
        )}
      </div>
    </BoardCard>
  );
}
