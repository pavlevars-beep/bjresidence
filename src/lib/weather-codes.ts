import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

/** WMO weather codes (used by Open-Meteo) mapped to an icon + SR/EN label. */
interface WeatherCodeInfo {
  icon: LucideIcon;
  nightIcon?: LucideIcon;
  sr: string;
  en: string;
}

const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { icon: Sun, nightIcon: Moon, sr: "Vedro", en: "Clear sky" },
  1: { icon: Sun, nightIcon: Moon, sr: "Pretežno vedro", en: "Mostly clear" },
  2: { icon: CloudSun, nightIcon: CloudMoon, sr: "Delimično oblačno", en: "Partly cloudy" },
  3: { icon: Cloud, sr: "Oblačno", en: "Overcast" },
  45: { icon: CloudFog, sr: "Magla", en: "Fog" },
  48: { icon: CloudFog, sr: "Magla sa injem", en: "Rime fog" },
  51: { icon: CloudDrizzle, sr: "Slaba rosulja", en: "Light drizzle" },
  53: { icon: CloudDrizzle, sr: "Rosulja", en: "Drizzle" },
  55: { icon: CloudDrizzle, sr: "Jaka rosulja", en: "Dense drizzle" },
  56: { icon: CloudDrizzle, sr: "Ledena rosulja", en: "Freezing drizzle" },
  57: { icon: CloudDrizzle, sr: "Jaka ledena rosulja", en: "Dense freezing drizzle" },
  61: { icon: CloudRain, sr: "Slaba kiša", en: "Light rain" },
  63: { icon: CloudRain, sr: "Kiša", en: "Rain" },
  65: { icon: CloudRain, sr: "Jaka kiša", en: "Heavy rain" },
  66: { icon: CloudRain, sr: "Ledena kiša", en: "Freezing rain" },
  67: { icon: CloudRain, sr: "Jaka ledena kiša", en: "Heavy freezing rain" },
  71: { icon: CloudSnow, sr: "Slab sneg", en: "Light snow" },
  73: { icon: CloudSnow, sr: "Sneg", en: "Snow" },
  75: { icon: CloudSnow, sr: "Jak sneg", en: "Heavy snow" },
  77: { icon: CloudSnow, sr: "Snežna zrna", en: "Snow grains" },
  80: { icon: CloudRain, sr: "Slab pljusak", en: "Light showers" },
  81: { icon: CloudRain, sr: "Pljusak", en: "Showers" },
  82: { icon: CloudRain, sr: "Jak pljusak", en: "Violent showers" },
  85: { icon: CloudSnow, sr: "Snežni pljusak", en: "Snow showers" },
  86: { icon: CloudSnow, sr: "Jak snežni pljusak", en: "Heavy snow showers" },
  95: { icon: CloudLightning, sr: "Grmljavina", en: "Thunderstorm" },
  96: { icon: CloudLightning, sr: "Grmljavina sa gradom", en: "Thunderstorm with hail" },
  99: { icon: CloudLightning, sr: "Jaka grmljavina sa gradom", en: "Severe thunderstorm with hail" },
};

const FALLBACK: WeatherCodeInfo = { icon: Cloud, sr: "Vremenska prognoza", en: "Weather" };

export function getWeatherInfo(code: number, isDay = true) {
  const info = WEATHER_CODES[code] ?? FALLBACK;
  return {
    icon: !isDay && info.nightIcon ? info.nightIcon : info.icon,
    sr: info.sr,
    en: info.en,
  };
}
