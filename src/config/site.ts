/**
 * Central content/config file for BJ Residence.
 * Change contact info, pricing, capacity and links here — the whole site reads from this file.
 */

export const siteConfig = {
  brand: {
    name: "BJ Residence",
  },

  // Single source of truth for the production domain — used to build absolute
  // URLs (e.g. the Info Point QR code) without hardcoding the string again.
  url: "https://bjresidence.rs",

  contact: {
    phone: "+381 62 475 550",
    phoneDisplay: "+381 62 475 550",
    whatsapp: "38162475550", // digits only, no + or spaces (used in wa.me links)
    email: "info@bjresidence.rs",
  },

  social: {
    instagram: "",
    facebook: "",
  },

  location: {
    address: "Braće Jerković 112g, Beograd",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Jerkovi%C4%87+112g%2C+Beograd",
  },

  capacity: {
    totalSpots: 4,
  },

  // Pricing display is optional and can be toggled off without touching any component.
  pricing: {
    showPrice: false,
    amount: 190,
    currency: "€",
  },

  availability: {
    // Simple manual flag for now — swap for a real calendar/Supabase query later.
    hasFreeSpots: true,
    freeSpots: 2,
  },

  gallery: {
    // Order here is the order images appear in the horizontal gallery strip.
    // width/height are each file's real pixel dimensions (post-optimization) —
    // used to size each carousel card at its native aspect ratio.
    categories: [
      {
        id: "exterior",
        images: [
          { src: "/images/gallery/ulaz.webp", captionKey: "exterior.img1", width: 1086, height: 1448 },
          { src: "/images/gallery/ulaz2.webp", captionKey: "exterior.img2", width: 1086, height: 1448 },
        ],
      },
      {
        id: "livingRoom",
        images: [
          { src: "/images/gallery/dnevniboravak1.webp", captionKey: "livingRoom.img1", width: 1448, height: 1086 },
          { src: "/images/gallery/dnevniboravak2.webp", captionKey: "livingRoom.img2", width: 1448, height: 1086 },
        ],
      },
      {
        id: "bedrooms",
        images: [
          { src: "/images/gallery/kabina.webp", captionKey: "bedrooms.img1", width: 1086, height: 1448 },
          { src: "/images/gallery/kabina2.webp", captionKey: "bedrooms.img2", width: 1086, height: 1448 },
        ],
      },
      {
        id: "kitchen",
        images: [
          { src: "/images/gallery/kuhinja.webp", captionKey: "kitchen.img1", width: 1086, height: 1448 },
          { src: "/images/gallery/kuhinja2.webp", captionKey: "kitchen.img2", width: 1448, height: 1086 },
          { src: "/images/gallery/kuhinja3.webp", captionKey: "kitchen.img3", width: 1448, height: 1086 },
        ],
      },
      {
        id: "bathroom",
        images: [{ src: "/images/gallery/kupatilo.webp", captionKey: "bathroom.img1", width: 1448, height: 1086 }],
      },
      {
        id: "details",
        images: [
          { src: "/images/gallery/hodnik.webp", captionKey: "details.img1", width: 1600, height: 900 },
          { src: "/images/gallery/kabine3.webp", captionKey: "details.img2", width: 1448, height: 1086 },
          { src: "/images/gallery/kabine4.webp", captionKey: "details.img3", width: 1086, height: 1448 },
        ],
      },
    ],
  },

  stayDurations: [
    { id: "1m", labelKey: "duration.1m" },
    { id: "2-3m", labelKey: "duration.2to3m" },
    { id: "4-6m", labelKey: "duration.4to6m" },
    { id: "6m+", labelKey: "duration.6mplus" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
