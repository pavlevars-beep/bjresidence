/** Shapes returned by the client-polled /api/info-board/* endpoints. */

export interface WeatherState {
  current: { temp: number; code: number; isDay: boolean; feelsLike: number | null };
  today: { min: number; max: number; sunrise: string | null; sunset: string | null };
  tomorrow: { min: number; max: number; code: number } | null;
  updatedAt: string;
}

export interface TrafficDestinationResult {
  id: string;
  nameSr: string;
  nameEn: string;
  minutes: number | null;
  live: boolean;
}

export interface TrafficState {
  destinations: TrafficDestinationResult[];
  updatedAt: string;
}

export interface WeatherApiResponse extends WeatherState {
  ok: boolean;
}

export interface TrafficApiResponse extends TrafficState {
  ok: boolean;
}

export interface ConfigApiResponse {
  ok: boolean;
  config: import("./info-board").InfoBoardConfig;
}
