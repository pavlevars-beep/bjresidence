/** European Air Quality Index (EAQI) bands — used by Open-Meteo's `european_aqi` field. */
interface AqiLevelInfo {
  sr: string;
  en: string;
  color: string;
}

const AQI_LEVELS: { max: number; info: AqiLevelInfo }[] = [
  { max: 20, info: { sr: "Dobar", en: "Good", color: "#7A9B6E" } },
  { max: 40, info: { sr: "Zadovoljavajući", en: "Fair", color: "#A8AD5E" } },
  { max: 60, info: { sr: "Umeren", en: "Moderate", color: "#D3A24A" } },
  { max: 80, info: { sr: "Loš", en: "Poor", color: "#C17A3E" } },
  { max: 100, info: { sr: "Vrlo loš", en: "Very poor", color: "#B0524A" } },
  { max: Infinity, info: { sr: "Opasan", en: "Extremely poor", color: "#7A3B52" } },
];

export function getAqiLevel(aqi: number): AqiLevelInfo {
  return (AQI_LEVELS.find((l) => aqi <= l.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1]).info;
}
