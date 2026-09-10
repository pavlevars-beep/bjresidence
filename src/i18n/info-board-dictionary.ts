/** Standalone SR/EN dictionary for the /info kiosk board — intentionally separate from the
 * marketing site's dictionaries.ts (different scope, different audience, own language toggle). */

export interface InfoBoardDictionary {
  greeting: { morning: string; afternoon: string; evening: string; welcome: string };
  weather: {
    location: string;
    today: string;
    tomorrow: string;
    unavailable: string;
    feelsLike: string;
    sunrise: string;
    sunset: string;
    airQuality: string;
  };
  cleaning: { title: string };
  weekly: { title: string };
  announcement: { title: string };
  traffic: { title: string; min: string; unavailable: string; whereWeAre: string };
  residence: { wifi: string; quietHours: string; contact: string };
  qr: { defaultLabel: string };
  ticker: { welcome: string; nextCleaning: string; today: string };
  lang: { sr: string; en: string };
}

export const infoBoardSr: InfoBoardDictionary = {
  greeting: {
    morning: "Dobro jutro",
    afternoon: "Dobar dan",
    evening: "Dobro veče",
    welcome: "Dobrodošli u BJ Residence",
  },
  weather: {
    location: "Beograd",
    today: "Danas",
    tomorrow: "Sutra",
    unavailable: "Vremenska prognoza trenutno nije dostupna",
    feelsLike: "Oseća se kao",
    sunrise: "Izlazak sunca",
    sunset: "Zalazak sunca",
    airQuality: "Kvalitet vazduha",
  },
  cleaning: { title: "Sledeće čišćenje" },
  weekly: { title: "Ove nedelje" },
  announcement: { title: "Važna informacija" },
  traffic: {
    title: "Saobraćaj sada",
    min: "min",
    unavailable: "Podaci o saobraćaju trenutno nisu dostupni",
    whereWeAre: "Ovde smo",
  },
  residence: { wifi: "Wi-Fi", quietHours: "Mir u objektu", contact: "Kontakt" },
  qr: { defaultLabel: "Skenirajte za više informacija" },
  ticker: { welcome: "Dobrodošli u BJ Residence", nextCleaning: "Sledeće čišćenje", today: "Danas" },
  lang: { sr: "SR", en: "EN" },
};

export const infoBoardEn: InfoBoardDictionary = {
  greeting: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    welcome: "Welcome to BJ Residence",
  },
  weather: {
    location: "Belgrade",
    today: "Today",
    tomorrow: "Tomorrow",
    unavailable: "Weather is currently unavailable",
    feelsLike: "Feels like",
    sunrise: "Sunrise",
    sunset: "Sunset",
    airQuality: "Air quality",
  },
  cleaning: { title: "Next cleaning" },
  weekly: { title: "This week" },
  announcement: { title: "Important information" },
  traffic: {
    title: "Traffic now",
    min: "min",
    unavailable: "Traffic data is currently unavailable",
    whereWeAre: "We are here",
  },
  residence: { wifi: "Wi-Fi", quietHours: "Quiet hours", contact: "Contact" },
  qr: { defaultLabel: "Scan for more information" },
  ticker: { welcome: "Welcome to BJ Residence", nextCleaning: "Next cleaning", today: "Today" },
  lang: { sr: "SR", en: "EN" },
};

export function getInfoBoardDictionary(locale: "sr" | "en"): InfoBoardDictionary {
  return locale === "sr" ? infoBoardSr : infoBoardEn;
}
