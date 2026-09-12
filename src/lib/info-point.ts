import { siteConfig } from "@/config/site";

/**
 * Types + defaults for the Info Point resident guide (/info-point) and its
 * admin section. Persisted via info-point-store.ts using the same JSON-file
 * pattern as info-board.ts/info-board-store.ts — deliberately reused rather
 * than introducing a database, matching this project's current scale.
 *
 * Architecture note: this module is designed to be reusable for other
 * properties later (see project notes on the "Info Point" product). Content
 * is fully data-driven (categories can be reordered/enabled from admin) and
 * BJ-specific facts live only in `defaultInfoPointConfig()`, never inside
 * component code — a future multi-property version would swap this default
 * factory per `property_id` without touching the UI layer.
 */

export type InfoPointCategoryKey =
  | "wifi"
  | "houseRules"
  | "issues"
  | "deviceGuides"
  | "nearby"
  | "transport"
  | "foodDelivery"
  | "workDestinations"
  | "emergency"
  | "contact";

export interface InfoPointCategory {
  key: InfoPointCategoryKey;
  titleSr: string;
  titleEn: string;
  enabled: boolean;
  order: number;
}

export interface InfoPointSettings {
  heroTitleSr: string;
  heroTitleEn: string;
  heroSubtitleSr: string;
  heroSubtitleEn: string;
}

export interface WifiConfig {
  enabled: boolean;
  networkName: string;
  password: string;
  revealMode: "visible" | "tap";
  showQr: boolean;
}

export interface HouseRuleSection {
  id: string;
  titleSr: string;
  titleEn: string;
  bodySr: string;
  bodyEn: string;
  icon: string; // lucide-react icon name, resolved by a lookup map in the UI
  order: number;
  enabled: boolean;
}

export interface HouseRules {
  summarySr: string;
  summaryEn: string;
  sections: HouseRuleSection[];
}

export interface DeviceGuide {
  id: string;
  titleSr: string;
  titleEn: string;
  image: string; // admin-provided URL, or "" for a neutral placeholder icon
  descriptionSr: string;
  descriptionEn: string;
  stepsSr: string[];
  stepsEn: string[];
  warningSr: string;
  warningEn: string;
  videoUrl: string;
  order: number;
  enabled: boolean;
}

export type NearbyPlaceCategory = "supermarket" | "pharmacy" | "atm" | "health" | "food" | "other";

export interface NearbyPlace {
  id: string;
  name: string;
  category: NearbyPlaceCategory;
  image: string;
  address: string;
  walkMinutes: number | null;
  hours: string;
  phone: string;
  mapsUrl: string;
  lat: number | null;
  lng: number | null;
  descriptionSr: string;
  descriptionEn: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface TransportRoute {
  id: string;
  titleSr: string;
  titleEn: string;
  bodySr: string;
  bodyEn: string;
  mapsUrl: string;
  order: number;
  enabled: boolean;
}

export interface TaxiOption {
  id: string;
  name: string;
  phone: string;
  url: string;
  description: string;
  order: number;
  enabled: boolean;
}

export type FoodLinkType = "delivery" | "restaurant" | "bakery" | "other";

export interface FoodLink {
  id: string;
  name: string;
  url: string;
  type: FoodLinkType;
  descriptionSr: string;
  descriptionEn: string;
  order: number;
  enabled: boolean;
}

export interface WorkDestination {
  id: string;
  companyName: string;
  address: string;
  instructionsSr: string;
  instructionsEn: string;
  mapsUrl: string;
  transportMode: string;
  estimatedMinutes: number | null;
  notes: string;
  order: number;
  enabled: boolean;
}

export interface EmergencyContact {
  id: string;
  labelSr: string;
  labelEn: string;
  phone: string;
  order: number;
  highlight: boolean;
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  viber: string;
  email: string;
  managerName: string;
  address: string;
  mapsUrl: string;
}

export interface InfoPointConfig {
  settings: InfoPointSettings;
  categories: InfoPointCategory[];
  wifi: WifiConfig;
  houseRules: HouseRules;
  deviceGuides: DeviceGuide[];
  nearbyPlaces: NearbyPlace[];
  transportRoutes: TransportRoute[];
  taxiOptions: TaxiOption[];
  foodLinks: FoodLink[];
  workDestinations: WorkDestination[];
  emergencyContacts: EmergencyContact[];
  contact: ContactInfo;
  updatedAt: string;
}

/** Defensive merge used when persisting admin edits — a partial/malformed PUT body never wipes other sections. */
export function mergeInfoPointConfig(base: InfoPointConfig, patch: Partial<InfoPointConfig>): InfoPointConfig {
  return {
    ...base,
    ...patch,
    settings: { ...base.settings, ...patch.settings },
    categories: Array.isArray(patch.categories) ? patch.categories : base.categories,
    wifi: { ...base.wifi, ...patch.wifi },
    houseRules: patch.houseRules
      ? {
          ...base.houseRules,
          ...patch.houseRules,
          sections: Array.isArray(patch.houseRules.sections) ? patch.houseRules.sections : base.houseRules.sections,
        }
      : base.houseRules,
    deviceGuides: Array.isArray(patch.deviceGuides) ? patch.deviceGuides : base.deviceGuides,
    nearbyPlaces: Array.isArray(patch.nearbyPlaces) ? patch.nearbyPlaces : base.nearbyPlaces,
    transportRoutes: Array.isArray(patch.transportRoutes) ? patch.transportRoutes : base.transportRoutes,
    taxiOptions: Array.isArray(patch.taxiOptions) ? patch.taxiOptions : base.taxiOptions,
    foodLinks: Array.isArray(patch.foodLinks) ? patch.foodLinks : base.foodLinks,
    workDestinations: Array.isArray(patch.workDestinations) ? patch.workDestinations : base.workDestinations,
    emergencyContacts: Array.isArray(patch.emergencyContacts) ? patch.emergencyContacts : base.emergencyContacts,
    contact: { ...base.contact, ...patch.contact },
  };
}

export function defaultInfoPointCategories(): InfoPointCategory[] {
  return [
    { key: "wifi", titleSr: "Wi-Fi", titleEn: "Wi-Fi", enabled: true, order: 0 },
    { key: "houseRules", titleSr: "Kućni red", titleEn: "House Rules", enabled: true, order: 1 },
    { key: "issues", titleSr: "Prijava kvara", titleEn: "Report an Issue", enabled: true, order: 2 },
    { key: "deviceGuides", titleSr: "Uputstva za uređaje", titleEn: "How to Use", enabled: true, order: 3 },
    { key: "nearby", titleSr: "U blizini", titleEn: "Nearby", enabled: true, order: 4 },
    { key: "transport", titleSr: "Prevoz", titleEn: "Transport", enabled: true, order: 5 },
    { key: "foodDelivery", titleSr: "Hrana i dostava", titleEn: "Food & Delivery", enabled: true, order: 6 },
    { key: "workDestinations", titleSr: "Kako do posla", titleEn: "Getting to Work", enabled: true, order: 7 },
    { key: "emergency", titleSr: "Hitni brojevi", titleEn: "Emergency", enabled: true, order: 8 },
    { key: "contact", titleSr: "Kontakt BJ Residence", titleEn: "Contact BJ Residence", enabled: true, order: 9 },
  ];
}

export function defaultInfoPointConfig(): InfoPointConfig {
  return {
    settings: {
      heroTitleSr: "Living at BJ",
      heroTitleEn: "Living at BJ",
      heroSubtitleSr: "Sve što vam je potrebno tokom boravka na jednom mestu.",
      heroSubtitleEn: "Everything you need during your stay in one place.",
    },
    categories: defaultInfoPointCategories(),
    wifi: {
      enabled: true,
      networkName: "BJ Residence Guest",
      password: "",
      revealMode: "tap",
      showQr: true,
    },
    houseRules: {
      summarySr: "Poštujte mir, čistoću i ostale stanare — ukratko, ponašajte se kao kod kuće koju delite sa drugima.",
      summaryEn: "Respect quiet hours, cleanliness and other residents — in short, treat it like a home you share.",
      sections: [
        {
          id: "quiet-hours",
          titleSr: "Tišina",
          titleEn: "Quiet hours",
          bodySr: "Od 22:00 do 07:00 molimo za tišinu — bez glasne muzike i razgovora u hodnicima.",
          bodyEn: "From 22:00 to 07:00 please keep noise down — no loud music or conversations in hallways.",
          icon: "Moon",
          order: 0,
          enabled: true,
        },
        {
          id: "shared-kitchen",
          titleSr: "Zajednička kuhinja",
          titleEn: "Shared kitchen",
          bodySr: "Operite svoje sudove odmah nakon upotrebe i očistite radnu površinu za sledećeg stanara.",
          bodyEn: "Wash your dishes right after use and wipe down the counter for the next resident.",
          icon: "UtensilsCrossed",
          order: 1,
          enabled: true,
        },
        {
          id: "bathroom",
          titleSr: "Kupatilo",
          titleEn: "Bathroom",
          bodySr: "Ostavite kupatilo čisto i suvo. Prijavite bilo kakav kvar odmah kroz Prijavu kvara.",
          bodyEn: "Leave the bathroom clean and dry. Report any fault immediately via Report an Issue.",
          icon: "ShowerHead",
          order: 2,
          enabled: true,
        },
        {
          id: "smoking",
          titleSr: "Pušenje",
          titleEn: "Smoking",
          bodySr: "Pušenje u zatvorenom prostoru nije dozvoljeno. Koristite predviđene spoljne prostore.",
          bodyEn: "Smoking indoors is not allowed. Please use the designated outdoor areas.",
          icon: "Ban",
          order: 3,
          enabled: true,
        },
        {
          id: "visitors",
          titleSr: "Posete",
          titleEn: "Visitors",
          bodySr: "Posete su moguće uz prethodnu najavu upravniku i uz obzir prema ostalim stanarima.",
          bodyEn: "Visitors are welcome with advance notice to the manager, and consideration for other residents.",
          icon: "Users",
          order: 4,
          enabled: true,
        },
        {
          id: "cleanliness",
          titleSr: "Čistoća",
          titleEn: "Cleanliness",
          bodySr: "Održavajte red u svojoj sobi i zajedničkim prostorijama. Raspored čišćenja je na Info tabli.",
          bodyEn: "Keep your room and shared areas tidy. The cleaning schedule is posted on the Info Board.",
          icon: "Sparkles",
          order: 5,
          enabled: true,
        },
        {
          id: "waste",
          titleSr: "Otpad",
          titleEn: "Waste",
          bodySr: "Kućni otpad odlažite u kontejnere iza zgrade. Razdvajajte reciklažu gde je moguće.",
          bodyEn: "Take household waste to the containers behind the building. Separate recyclables where possible.",
          icon: "Trash2",
          order: 6,
          enabled: true,
        },
        {
          id: "shared-spaces",
          titleSr: "Zajednički prostori",
          titleEn: "Shared spaces",
          bodySr: "Dnevni boravak i hodnici su zajednički — ne ostavljajte lične stvari van svoje sobe.",
          bodyEn: "The living room and hallways are shared — please don't leave personal items outside your room.",
          icon: "Sofa",
          order: 7,
          enabled: true,
        },
        {
          id: "safety",
          titleSr: "Bezbednost",
          titleEn: "Safety",
          bodySr: "Zaključavajte ulazna vrata. Ne dajte ključeve/šifre trećim licima.",
          bodyEn: "Lock the entrance door. Don't share keys/access codes with third parties.",
          icon: "ShieldCheck",
          order: 8,
          enabled: true,
        },
        {
          id: "damages",
          titleSr: "Šteta",
          titleEn: "Damages",
          bodySr: "Svaku štetu prijavite odmah — brzo rešavanje je u interesu svih stanara.",
          bodyEn: "Report any damage right away — a quick fix is in every resident's interest.",
          icon: "AlertTriangle",
          order: 9,
          enabled: true,
        },
      ],
    },
    deviceGuides: [
      {
        id: "ac",
        titleSr: "Klima uređaj",
        titleEn: "Air conditioner",
        image: "",
        descriptionSr: "Daljinski upravljač se nalazi na zidnom držaču pored uređaja.",
        descriptionEn: "The remote control is on the wall mount next to the unit.",
        stepsSr: [
          "Uperite daljinski ka uređaju i pritisnite dugme za uključivanje.",
          "Podesite željenu temperaturu strelicama.",
          "Za hlađenje izaberite režim 'Cool' (snežna pahulja).",
          "Ugasite uređaj pre napuštanja sobe na duže vreme.",
        ],
        stepsEn: [
          "Point the remote at the unit and press the power button.",
          "Set the desired temperature with the arrow buttons.",
          "For cooling, select 'Cool' mode (snowflake icon).",
          "Turn the unit off before leaving the room for an extended time.",
        ],
        warningSr: "Ne ostavljajte prozor otvoren dok klima radi.",
        warningEn: "Don't leave the window open while the AC is running.",
        videoUrl: "",
        order: 0,
        enabled: true,
      },
      {
        id: "tv",
        titleSr: "Televizor",
        titleEn: "TV",
        image: "",
        descriptionSr: "Uključite televizor i set-top box dugmetom na daljinskom.",
        descriptionEn: "Turn on both the TV and the set-top box using their remotes.",
        stepsSr: [
          "Pritisnite dugme za uključivanje na TV daljinskom.",
          "Izaberite ispravan HDMI izvor ako je potrebno.",
          "Za promenu kanala koristite drugi daljinski (set-top box), ako postoji.",
        ],
        stepsEn: [
          "Press the power button on the TV remote.",
          "Select the correct HDMI source if needed.",
          "Use the second remote (set-top box) to change channels, if applicable.",
        ],
        warningSr: "",
        warningEn: "",
        videoUrl: "",
        order: 1,
        enabled: true,
      },
      {
        id: "hob",
        titleSr: "Šporet / ringle",
        titleEn: "Kitchen hob",
        image: "",
        descriptionSr: "Električne ringle u zajedničkoj kuhinji.",
        descriptionEn: "Electric hob in the shared kitchen.",
        stepsSr: [
          "Okrenite regulator na željenu ringlu.",
          "Podesite jačinu grejanja okretanjem dugmeta.",
          "Nakon kuvanja vratite regulator na nulu i sačekajte da se ringla ohladi.",
        ],
        stepsEn: [
          "Turn the dial for the burner you want to use.",
          "Set the heat level by turning the knob.",
          "After cooking, turn the dial back to zero and let the burner cool down.",
        ],
        warningSr: "Ne ostavljajte upaljenu ringlu bez nadzora.",
        warningEn: "Never leave a hot burner unattended.",
        videoUrl: "",
        order: 2,
        enabled: true,
      },
      {
        id: "fridge",
        titleSr: "Frižider",
        titleEn: "Refrigerator",
        image: "",
        descriptionSr: "Zajednički frižider — molimo označite svoju hranu.",
        descriptionEn: "Shared refrigerator — please label your food.",
        stepsSr: [
          "Temperatura je već podešena — nije potrebno menjati podešavanja.",
          "Zatvarajte vrata do kraja radi uštede energije.",
          "Redovno uklanjajte isteklu hranu.",
        ],
        stepsEn: [
          "The temperature is already set — no need to change settings.",
          "Close the door fully to save energy.",
          "Please remove expired food regularly.",
        ],
        warningSr: "",
        warningEn: "",
        videoUrl: "",
        order: 3,
        enabled: true,
      },
      {
        id: "water-heater",
        titleSr: "Bojler",
        titleEn: "Water heater",
        image: "",
        descriptionSr: "Bojler za toplu vodu se nalazi u kupatilu/ostavi.",
        descriptionEn: "The water heater is located in the bathroom/utility area.",
        stepsSr: [
          "Uređaj je uključen i podešen na odgovarajuću temperaturu.",
          "Ostavite prekidač uključen — voda se automatski greje.",
          "Ako nema tople vode, sačekajte oko 30-60 minuta ili prijavite kvar.",
        ],
        stepsEn: [
          "The unit is already switched on and set to the right temperature.",
          "Leave the switch on — water heats automatically.",
          "If there's no hot water, wait around 30–60 minutes or report an issue.",
        ],
        warningSr: "",
        warningEn: "",
        videoUrl: "",
        order: 4,
        enabled: true,
      },
      {
        id: "info-tablet",
        titleSr: "Info tabla",
        titleEn: "Info tablet",
        image: "",
        descriptionSr: "Tablet na zidu prikazuje vreme, čišćenje, saobraćaj i najave.",
        descriptionEn: "The wall tablet shows weather, cleaning schedule, traffic and announcements.",
        stepsSr: [
          "Skenirajte QR kod na tabletu telefonom da otvorite ovaj vodič bilo gde.",
          "Tablet je samo za pregled — molimo ne skidajte ga sa držača.",
        ],
        stepsEn: [
          "Scan the QR code on the tablet with your phone to open this guide anywhere.",
          "The tablet is for viewing only — please don't remove it from its mount.",
        ],
        warningSr: "",
        warningEn: "",
        videoUrl: "",
        order: 5,
        enabled: true,
      },
    ],
    nearbyPlaces: [
      {
        id: "super-vero",
        name: "Super Vero",
        category: "supermarket",
        image: "",
        address: "Braće Jerković 114, Beograd",
        walkMinutes: 1,
        hours: "07:30–22:00 (svaki dan)",
        phone: "011 3962 144",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Super+Vero+Bra%C4%87e+Jerkovi%C4%87+114+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Supermarket odmah pored zgrade — najbliža opcija za svakodnevne namirnice.",
        descriptionEn: "Supermarket right next to the building — the closest option for everyday groceries.",
        featured: true,
        visible: true,
        order: 0,
      },
      {
        id: "apoteka-beolek",
        name: "Apoteka Beolek",
        category: "pharmacy",
        image: "",
        address: "Braće Jerković 108v, Beograd",
        walkMinutes: 3,
        hours: "Pon–Pet 07:30–20:30, Sub 07:30–16:00, Ned 08:00–14:00",
        phone: "011 3970 014",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Apoteka+Beolek+Bra%C4%87e+Jerkovi%C4%87+108v+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Najbliža apoteka, nekoliko brojeva niz ulicu.",
        descriptionEn: "The closest pharmacy, just a few doors down the street.",
        featured: true,
        visible: true,
        order: 1,
      },
      {
        id: "apoteka-oaza-zdravlja",
        name: "Apoteka Oaza zdravlja",
        category: "pharmacy",
        image: "",
        address: "Braće Jerković 123d, Beograd",
        walkMinutes: 8,
        hours: "Pon–Pet 07:30–21:00, Sub 08:00–17:00, Ned 06:00–14:00",
        phone: "",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Apoteka+Oaza+Zdravlja+Bra%C4%87e+Jerkovi%C4%87+123d+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Alternativna apoteka sa dužim radnim vremenom, radi i nedeljom od ranog jutra.",
        descriptionEn: "An alternative pharmacy with longer hours, also open early on Sundays.",
        featured: false,
        visible: true,
        order: 2,
      },
      {
        id: "apoteka-24h",
        name: "Apoteka Family Pharm (24h)",
        category: "pharmacy",
        image: "",
        address: "Vojvode Stepe 240, Beograd",
        walkMinutes: null,
        hours: "Non-stop, 24 časa",
        phone: "011 2495 608",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Apoteka+Family+Pharm+Vojvode+Stepe+240+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Jedina dežurna (24h) apoteka u široj okolini — nije na pešačkoj udaljenosti, potreban je prevoz.",
        descriptionEn: "The only 24h pharmacy in the wider area — not walking distance, transport is needed.",
        featured: false,
        visible: true,
        order: 3,
      },
      {
        id: "pekara-dule",
        name: "Pekara Dule",
        category: "food",
        image: "",
        address: "Braće Jerković 123, Beograd",
        walkMinutes: 8,
        hours: "",
        phone: "",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pekara+Dule+Bra%C4%87e+Jerkovi%C4%87+123+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Pekara za sveže pecivo i hleb.",
        descriptionEn: "Bakery for fresh pastries and bread.",
        featured: false,
        visible: true,
        order: 4,
      },
      {
        id: "dom-zdravlja-vozdovac",
        name: "Dom zdravlja Voždovac",
        category: "health",
        image: "",
        address: "Ustanička 16, Beograd",
        walkMinutes: null,
        hours: "Pon–Pet 07:00–19:30, Sub–Ned 08:00–18:00",
        phone: "011 3080 500",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dom+zdravlja+Vo%C5%BEdovac+Ustani%C4%8Dka+16+Beograd",
        lat: null,
        lng: null,
        descriptionSr: "Najbliži dom zdravlja — proverite tačnu udaljenost, nije na istoj ulici.",
        descriptionEn: "The nearest health centre — please verify exact distance, it's not on the same street.",
        featured: false,
        visible: true,
        order: 5,
      },
    ],
    transportRoutes: [
      {
        id: "linija-26",
        titleSr: "Linija 26 — do centra grada",
        titleEn: "Line 26 — to the city centre",
        bodySr:
          "Polazi sa okretnice Braće Jerković i vozi direktno do Trga Republike i Terazija (Dorćol/Dunavska pravac). Najpraktičnija linija za odlazak u centar.",
        bodyEn:
          "Departs from the Braće Jerković terminus and runs directly to Trg Republike and Terazije (Dorćol/Dunavska direction). The most practical line for reaching the city centre.",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Trg+Republike%2C+Beograd",
        order: 0,
        enabled: true,
      },
    ],
    taxiOptions: [
      {
        id: "car-go",
        name: "CarGo",
        phone: "",
        url: "https://www.cargo.rs/",
        description: "Poručivanje taksija preko aplikacije, sa unapred vidljivom cenom.",
        order: 0,
        enabled: true,
      },
      {
        id: "pink-taxi",
        name: "Pink Taxi",
        phone: "011 9803",
        url: "",
        description: "Poziv telefonom, dostupno 24 časa.",
        order: 1,
        enabled: true,
      },
    ],
    foodLinks: [
      {
        id: "wolt",
        name: "Wolt",
        url: "https://wolt.com/",
        type: "delivery",
        descriptionSr: "Dostava hrane iz restorana u okolini.",
        descriptionEn: "Food delivery from restaurants in the area.",
        order: 0,
        enabled: true,
      },
      {
        id: "glovo",
        name: "Glovo",
        url: "https://glovoapp.com/",
        type: "delivery",
        descriptionSr: "Dostava hrane i namirnica.",
        descriptionEn: "Food and grocery delivery.",
        order: 1,
        enabled: true,
      },
    ],
    workDestinations: [],
    emergencyContacts: [
      { id: "police", labelSr: "Policija", labelEn: "Police", phone: "192", order: 0, highlight: true },
      { id: "ambulance", labelSr: "Hitna pomoć", labelEn: "Ambulance", phone: "194", order: 1, highlight: true },
      { id: "fire", labelSr: "Vatrogasci", labelEn: "Fire department", phone: "193", order: 2, highlight: true },
      {
        id: "eu-emergency",
        labelSr: "Jedinstveni broj za hitne slučajeve",
        labelEn: "Single European emergency number",
        phone: "112",
        order: 3,
        highlight: false,
      },
      {
        id: "manager",
        labelSr: "Upravnik BJ Residence",
        labelEn: "BJ Residence manager",
        phone: siteConfig.contact.phoneDisplay,
        order: 4,
        highlight: false,
      },
    ],
    contact: {
      phone: siteConfig.contact.phoneDisplay,
      whatsapp: siteConfig.contact.whatsapp,
      viber: "",
      email: siteConfig.contact.email,
      managerName: "",
      address: siteConfig.location.address,
      mapsUrl: siteConfig.location.googleMapsUrl,
    },
    updatedAt: new Date(0).toISOString(),
  };
}
