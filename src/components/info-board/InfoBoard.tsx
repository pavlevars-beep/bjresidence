"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfoBoardLanguage } from "@/i18n/InfoBoardLanguageContext";
import { usePolledResource } from "@/lib/use-polled-resource";
import { getBelgradeDateString } from "@/lib/board-format";
import { defaultInfoBoardConfig } from "@/lib/info-board";
import { cn } from "@/lib/utils";
import type { ConfigApiResponse, TrafficApiResponse, WeatherApiResponse } from "@/lib/info-board-client-types";
import { InfoHeader } from "./InfoHeader";
import { Greeting } from "./Greeting";
import { WeatherCard } from "./WeatherCard";
import { CleaningCard } from "./CleaningCard";
import { AnnouncementCard } from "./AnnouncementCard";
import { WeeklyEvents } from "./WeeklyEvents";
import { TrafficCard } from "./TrafficCard";
import { ResidenceInfo } from "./ResidenceInfo";
import { QRCard } from "./QRCard";
import { LanguageSwitcher } from "./LanguageSwitcher";

const CONFIG_POLL_MS = 45_000;
const WEATHER_POLL_MS = 15 * 60_000;
const TRAFFIC_POLL_MS = 5 * 60_000;
const CLOCK_TICK_MS = 1000;

// Literal class strings so Tailwind's JIT scanner picks them up even though the
// lookup itself happens at runtime (see tailwind.config content globs).
const MAIN_ROW_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
};

export function InfoBoard() {
  const { locale, setLocale, dict } = useInfoBoardLanguage();
  // Starts null so the server-rendered markup and the client's first hydration
  // pass are identical (neither knows the real clock time yet); the real time
  // is only set after mount, avoiding any hydration mismatch on the ticking clock.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const configResp = usePolledResource<ConfigApiResponse>(
    "/api/info-board",
    CONFIG_POLL_MS,
    "bj-info-board-config-cache"
  );
  const weather = usePolledResource<WeatherApiResponse>(
    "/api/info-board/weather",
    WEATHER_POLL_MS,
    "bj-info-board-weather-cache"
  );
  const traffic = usePolledResource<TrafficApiResponse>(
    "/api/info-board/traffic",
    TRAFFIC_POLL_MS,
    "bj-info-board-traffic-cache"
  );

  const config = configResp?.config ?? defaultInfoBoardConfig();
  const todayStr = now ? getBelgradeDateString(now) : "";

  const isCleaningActive = config.cleaning.enabled && !!config.cleaning.date && config.cleaning.date >= todayStr;

  const isAnnouncementActive =
    config.announcement.enabled &&
    !!(config.announcement.textSr || config.announcement.textEn) &&
    (!config.announcement.activeFrom || config.announcement.activeFrom <= todayStr) &&
    (!config.announcement.activeUntil || config.announcement.activeUntil >= todayStr);

  const visibleWeeklyItems = useMemo(
    () => config.weeklyItems.filter((i) => i.visible && i.date >= todayStr),
    [config.weeklyItems, todayStr]
  );

  const hasTraffic = (traffic?.destinations?.length ?? 0) > 0;
  const hasWeekly = visibleWeeklyItems.length > 0;

  const mainCount = 1 + (isCleaningActive ? 1 : 0) + (hasTraffic ? 1 : 0);

  if (!now) {
    return <div className="h-[100dvh] w-full bg-cream" />;
  }

  return (
    <div
      className="flex h-[100dvh] w-full select-none flex-col overflow-hidden bg-cream px-5 py-3 [overscroll-behavior:none] sm:px-8 sm:py-4"
    >
      <InfoHeader now={now} locale={locale} />

      <div className="mt-2.5 sm:mt-3">
        <Greeting now={now} dict={dict} />
      </div>

      {isAnnouncementActive && (
        <div className="mt-2.5 sm:mt-3">
          <AnnouncementCard announcement={config.announcement} locale={locale} />
        </div>
      )}

      <div
        className={cn(
          "mt-2.5 grid min-h-0 flex-1 gap-3 sm:mt-3 sm:gap-4",
          MAIN_ROW_COLS[mainCount] ?? MAIN_ROW_COLS[3]
        )}
      >
        <div className={cn("h-full min-h-0", mainCount === 1 && "max-w-lg")}>
          <WeatherCard weather={weather?.ok ? weather : null} locale={locale} dict={dict} />
        </div>
        {isCleaningActive && (
          <div className="h-full min-h-0">
            <CleaningCard cleaning={config.cleaning} locale={locale} dict={dict} />
          </div>
        )}
        {hasTraffic && (
          <div className="h-full min-h-0">
            <TrafficCard traffic={traffic?.ok ? traffic : null} locale={locale} dict={dict} />
          </div>
        )}
      </div>

      {hasWeekly && (
        <div className="mt-2.5 shrink-0 sm:mt-3">
          <WeeklyEvents items={visibleWeeklyItems} locale={locale} dict={dict} />
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-2.5 sm:mt-3 sm:pt-3">
        <ResidenceInfo info={config.residenceInfo} dict={dict} />
        <div className="flex items-center gap-4">
          <QRCard qr={config.qr} locale={locale} />
          <LanguageSwitcher locale={locale} setLocale={setLocale} />
        </div>
      </div>
    </div>
  );
}
