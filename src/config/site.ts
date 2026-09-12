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
    categories: [
      {
        id: "bedrooms",
        images: [
          { src: "/images/gallery/bedroom-1.jpg", captionKey: "bedrooms.img1" },
          { src: "/images/gallery/bedroom-2.jpg", captionKey: "bedrooms.img2" },
        ],
      },
      {
        id: "kitchen",
        images: [
          { src: "/images/gallery/kitchen-1.jpg", captionKey: "kitchen.img1" },
          { src: "/images/gallery/kitchen-2.jpg", captionKey: "kitchen.img2" },
        ],
      },
      {
        id: "bathroom",
        images: [{ src: "/images/gallery/bathroom-1.jpg", captionKey: "bathroom.img1" }],
      },
      {
        id: "storage",
        images: [{ src: "/images/gallery/storage-1.svg", captionKey: "storage.img1" }],
      },
      {
        id: "details",
        images: [
          { src: "/images/gallery/details-1.jpg", captionKey: "details.img1" },
          { src: "/images/gallery/details-2.jpg", captionKey: "details.img2" },
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
