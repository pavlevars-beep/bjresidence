import { siteConfig } from "@/config/site";

/**
 * Types + defaults for the /info kiosk board. Persisted via info-board-store.ts.
 */

export interface CleaningInfo {
  enabled: boolean;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  noteSr: string;
  noteEn: string;
}

export interface Announcement {
  enabled: boolean;
  titleSr: string;
  titleEn: string;
  textSr: string;
  textEn: string;
  activeFrom: string; // YYYY-MM-DD or ""
  activeUntil: string; // YYYY-MM-DD or ""
}

export interface WeeklyItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or ""
  titleSr: string;
  titleEn: string;
  descriptionSr: string;
  descriptionEn: string;
  visible: boolean;
  priority: number;
}

export interface ResidenceInfo {
  wifiEnabled: boolean;
  wifiName: string;
  quietHoursEnabled: boolean;
  quietHoursText: string;
  contactEnabled: boolean;
  contactPhone: string;
}

export interface QrSettings {
  enabled: boolean;
  url: string;
  labelSr: string;
  labelEn: string;
}

export interface TrafficDestination {
  id: string;
  enabled: boolean;
  nameSr: string;
  nameEn: string;
  destination: string;
  fallbackMinutes: number | null;
  order: number;
}

export interface InfoBoardConfig {
  cleaning: CleaningInfo;
  announcement: Announcement;
  weeklyItems: WeeklyItem[];
  residenceInfo: ResidenceInfo;
  qr: QrSettings;
  trafficDestinations: TrafficDestination[];
  updatedAt: string;
}

/** Defensive merge used when persisting admin edits — a partial/malformed PUT body never wipes other sections. */
export function mergeInfoBoardConfig(base: InfoBoardConfig, patch: Partial<InfoBoardConfig>): InfoBoardConfig {
  return {
    ...base,
    ...patch,
    cleaning: { ...base.cleaning, ...patch.cleaning },
    announcement: { ...base.announcement, ...patch.announcement },
    residenceInfo: { ...base.residenceInfo, ...patch.residenceInfo },
    qr: { ...base.qr, ...patch.qr },
    weeklyItems: Array.isArray(patch.weeklyItems) ? patch.weeklyItems : base.weeklyItems,
    trafficDestinations: Array.isArray(patch.trafficDestinations)
      ? patch.trafficDestinations
      : base.trafficDestinations,
  };
}

export function defaultInfoBoardConfig(): InfoBoardConfig {
  return {
    cleaning: {
      enabled: false,
      date: "",
      startTime: "10:00",
      endTime: "13:00",
      noteSr: "",
      noteEn: "",
    },
    announcement: {
      enabled: false,
      titleSr: "",
      titleEn: "",
      textSr: "",
      textEn: "",
      activeFrom: "",
      activeUntil: "",
    },
    weeklyItems: [],
    residenceInfo: {
      wifiEnabled: true,
      wifiName: "BJ Residence Guest",
      quietHoursEnabled: true,
      quietHoursText: "22:00–07:00",
      contactEnabled: true,
      contactPhone: siteConfig.contact.phoneDisplay,
    },
    qr: {
      enabled: true,
      url: "https://bjresidence.rs",
      labelSr: "Skenirajte za više informacija",
      labelEn: "Scan for more information",
    },
    trafficDestinations: [
      {
        id: "centar",
        enabled: true,
        nameSr: "Centar",
        nameEn: "City Center",
        destination: "Trg Republike, Beograd",
        fallbackMinutes: 22,
        order: 0,
      },
      {
        id: "novi-beograd",
        enabled: true,
        nameSr: "Novi Beograd",
        nameEn: "New Belgrade",
        destination: "Novi Beograd, Beograd",
        fallbackMinutes: 27,
        order: 1,
      },
      {
        id: "aerodrom",
        enabled: true,
        nameSr: "Aerodrom",
        nameEn: "Airport",
        destination: "Aerodrom Nikola Tesla, Beograd",
        fallbackMinutes: 32,
        order: 2,
      },
    ],
    updatedAt: new Date(0).toISOString(),
  };
}
