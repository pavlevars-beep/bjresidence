/**
 * Standalone SR/EN dictionary for the public /info-point resident guide —
 * intentionally separate from the marketing site's dictionaries.ts and from
 * info-board-dictionary.ts (different scope/audience, own language toggle).
 *
 * Adding a future language (e.g. Nepali) means adding one entry to the
 * `dictionaries` registry below plus a value satisfying InfoPointDictionary —
 * no component changes required. Locale-specific admin CONTENT (place names,
 * house rules text, etc.) lives in info-point.ts instead, as *_sr/*_en fields.
 */

export interface InfoPointDictionary {
  header: { title: string; subtitle: string; scanHint: string };
  quickActions: {
    wifi: string;
    reportIssue: string;
    houseRules: string;
    nearby: string;
    transport: string;
    emergency: string;
  };
  search: { placeholder: string; noResults: string };
  common: {
    copy: string;
    copied: string;
    call: string;
    directions: string;
    openMaps: string;
    close: string;
    back: string;
    show: string;
    hide: string;
    minutesWalk: string;
    open: string;
    website: string;
    send: string;
    optional: string;
  };
  wifi: {
    title: string;
    network: string;
    password: string;
    revealPassword: string;
    copyPassword: string;
    copyNetwork: string;
    scanToConnect: string;
  };
  houseRules: { title: string; summaryTitle: string; fullTitle: string };
  issues: {
    title: string;
    intro: string;
    category: string;
    categoryOptions: Record<string, string>;
    location: string;
    locationOptions: Record<string, string>;
    description: string;
    descriptionPlaceholder: string;
    photo: string;
    photoHint: string;
    residentName: string;
    residentNamePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    errorTitle: string;
    errorBody: string;
  };
  deviceGuides: { title: string; steps: string; warning: string; watchVideo: string };
  nearby: {
    title: string;
    filters: Record<string, string>;
    featured: string;
    map: string;
    list: string;
    noPlaces: string;
  };
  transport: { title: string; taxiTitle: string; taxiTip: string };
  foodDelivery: { title: string };
  workDestinations: { title: string; empty: string; estimatedTime: string };
  emergency: { title: string; disclaimer: string };
  contact: { title: string; manager: string };
  lang: { sr: string; en: string };
}

const infoPointSr: InfoPointDictionary = {
  header: {
    title: "Living at BJ",
    subtitle: "Sve što vam je potrebno tokom boravka na jednom mestu.",
    scanHint: "Sačuvajte ovu stranicu — koristiće vam tokom celog boravka.",
  },
  quickActions: {
    wifi: "Wi-Fi",
    reportIssue: "Prijavi kvar",
    houseRules: "Kućni red",
    nearby: "U blizini",
    transport: "Prevoz",
    emergency: "Hitni brojevi",
  },
  search: { placeholder: "Šta tražite?", noResults: "Nema rezultata. Pokušajte drugi pojam." },
  common: {
    copy: "Kopiraj",
    copied: "Kopirano",
    call: "Pozovi",
    directions: "Putanja",
    openMaps: "Otvori mapu",
    close: "Zatvori",
    back: "Nazad",
    show: "Prikaži",
    hide: "Sakrij",
    minutesWalk: "min pešice",
    open: "Otvori",
    website: "Sajt",
    send: "Pošalji",
    optional: "opciono",
  },
  wifi: {
    title: "Wi-Fi",
    network: "Mreža",
    password: "Lozinka",
    revealPassword: "Prikaži lozinku",
    copyPassword: "Kopiraj lozinku",
    copyNetwork: "Kopiraj naziv mreže",
    scanToConnect: "Skenirajte za povezivanje",
  },
  houseRules: { title: "Kućni red", summaryTitle: "Ukratko", fullTitle: "Kompletan kućni red" },
  issues: {
    title: "Prijava kvara",
    intro: "Opišite problem i javićemo se u najkraćem roku.",
    category: "Kategorija",
    categoryOptions: {
      electricity: "Struja",
      plumbing: "Vodovod",
      climate: "Grejanje / hlađenje",
      internet: "Internet",
      furniture: "Nameštaj",
      cleaning: "Čišćenje",
      other: "Ostalo",
    },
    location: "Lokacija",
    locationOptions: {
      room: "Soba",
      kitchen: "Kuhinja",
      bathroom: "Kupatilo",
      living_room: "Dnevni boravak",
      hallway: "Hodnik",
      other: "Ostalo",
    },
    description: "Opis problema",
    descriptionPlaceholder: "Opišite šta ne radi ili šta je oštećeno...",
    photo: "Fotografija",
    photoHint: "Opciono — pomaže nam da brže rešimo problem.",
    residentName: "Ime (opciono)",
    residentNamePlaceholder: "Vaše ime ili broj sobe",
    submit: "Pošalji prijavu",
    submitting: "Slanje...",
    successTitle: "Prijava je poslata",
    successBody: "Hvala! Javićemo se u najkraćem roku.",
    errorTitle: "Greška",
    errorBody: "Prijava nije uspela. Pokušajte ponovo ili nas pozovite direktno.",
  },
  deviceGuides: { title: "Uputstva za uređaje", steps: "Koraci", warning: "Napomena", watchVideo: "Pogledaj video" },
  nearby: {
    title: "U blizini",
    filters: {
      all: "Sve",
      supermarket: "Prodavnice",
      pharmacy: "Apoteke",
      atm: "Bankomati",
      health: "Zdravstvo",
      food: "Hrana",
      other: "Ostalo",
    },
    featured: "Izdvojeno",
    map: "Mapa",
    list: "Lista",
    noPlaces: "Trenutno nema dodatih lokacija u ovoj kategoriji.",
  },
  transport: { title: "Prevoz", taxiTitle: "Taxi", taxiTip: "Cena zavisi od udaljenosti — dogovorite je unapred ili proverite u aplikaciji pre polaska." },
  foodDelivery: { title: "Hrana i dostava" },
  workDestinations: {
    title: "Kako do posla",
    empty: "Trenutno nema podešenih destinacija. Kontaktirajte upravnika za informacije.",
    estimatedTime: "Očekivano vreme puta",
  },
  emergency: { title: "Hitni brojevi", disclaimer: "U hitnim slučajevima uvek prvo pozovite 192 / 194 / 193 / 112." },
  contact: { title: "Kontakt BJ Residence", manager: "Upravnik" },
  lang: { sr: "SR", en: "EN" },
};

const infoPointEn: InfoPointDictionary = {
  header: {
    title: "Living at BJ",
    subtitle: "Everything you need during your stay in one place.",
    scanHint: "Save this page — you'll use it throughout your stay.",
  },
  quickActions: {
    wifi: "Wi-Fi",
    reportIssue: "Report an issue",
    houseRules: "House rules",
    nearby: "Nearby",
    transport: "Transport",
    emergency: "Emergency",
  },
  search: { placeholder: "What do you need?", noResults: "No results. Try a different word." },
  common: {
    copy: "Copy",
    copied: "Copied",
    call: "Call",
    directions: "Directions",
    openMaps: "Open in Maps",
    close: "Close",
    back: "Back",
    show: "Show",
    hide: "Hide",
    minutesWalk: "min walk",
    open: "Open",
    website: "Website",
    send: "Send",
    optional: "optional",
  },
  wifi: {
    title: "Wi-Fi",
    network: "Network",
    password: "Password",
    revealPassword: "Show password",
    copyPassword: "Copy password",
    copyNetwork: "Copy network name",
    scanToConnect: "Scan to connect",
  },
  houseRules: { title: "House Rules", summaryTitle: "In short", fullTitle: "Full house rules" },
  issues: {
    title: "Report an issue",
    intro: "Describe the problem and we'll get back to you as soon as possible.",
    category: "Category",
    categoryOptions: {
      electricity: "Electricity",
      plumbing: "Plumbing",
      climate: "Heating / cooling",
      internet: "Internet",
      furniture: "Furniture",
      cleaning: "Cleaning",
      other: "Other",
    },
    location: "Location",
    locationOptions: {
      room: "Room",
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      living_room: "Living room",
      hallway: "Hallway",
      other: "Other",
    },
    description: "Description",
    descriptionPlaceholder: "Describe what's not working or damaged...",
    photo: "Photo",
    photoHint: "Optional — helps us fix it faster.",
    residentName: "Name (optional)",
    residentNamePlaceholder: "Your name or room number",
    submit: "Report issue",
    submitting: "Sending...",
    successTitle: "Report submitted",
    successBody: "Thank you! We'll get back to you as soon as possible.",
    errorTitle: "Error",
    errorBody: "Couldn't submit the report. Please try again or contact us directly.",
  },
  deviceGuides: { title: "How to Use", steps: "Steps", warning: "Note", watchVideo: "Watch video" },
  nearby: {
    title: "Nearby",
    filters: {
      all: "All",
      supermarket: "Stores",
      pharmacy: "Pharmacies",
      atm: "ATMs",
      health: "Healthcare",
      food: "Food",
      other: "Other",
    },
    featured: "Featured",
    map: "Map",
    list: "List",
    noPlaces: "No places added in this category yet.",
  },
  transport: { title: "Transport", taxiTitle: "Taxi", taxiTip: "Price depends on distance — agree on it upfront or check the app before you ride." },
  foodDelivery: { title: "Food & Delivery" },
  workDestinations: {
    title: "Getting to Work",
    empty: "No destinations configured yet. Contact the manager for information.",
    estimatedTime: "Estimated travel time",
  },
  emergency: { title: "Emergency", disclaimer: "In an emergency always call 192 / 194 / 193 / 112 first." },
  contact: { title: "Contact BJ Residence", manager: "Manager" },
  lang: { sr: "SR", en: "EN" },
};

/** Locale registry — add a key here (+ a value above) to support a new language later. */
const dictionaries = {
  sr: infoPointSr,
  en: infoPointEn,
} as const;

export type InfoPointLocale = keyof typeof dictionaries;

export function getInfoPointDictionary(locale: string): InfoPointDictionary {
  return (dictionaries as Record<string, InfoPointDictionary>)[locale] ?? infoPointSr;
}

export const infoPointLocales = Object.keys(dictionaries) as InfoPointLocale[];
