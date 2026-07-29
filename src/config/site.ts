/**
 * Central content/config file for BJ Residence.
 * Change contact info, pricing, capacity and links here — the whole site reads from this file.
 */

export const siteConfig = {
  brand: {
    name: "BJ Residence",
  },

  contact: {
    phone: "+381 60 123 4567",
    phoneDisplay: "+381 60 123 4567",
    whatsapp: "381601234567", // digits only, no + or spaces (used in wa.me links)
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
    totalSpots: 6,
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
          { src: "/images/gallery/bedroom-1.svg", captionKey: "bedrooms.img1" },
          { src: "/images/gallery/bedroom-2.svg", captionKey: "bedrooms.img2" },
        ],
      },
      {
        id: "kitchen",
        images: [
          { src: "/images/gallery/kitchen-1.svg", captionKey: "kitchen.img1" },
          { src: "/images/gallery/kitchen-2.svg", captionKey: "kitchen.img2" },
        ],
      },
      {
        id: "bathroom",
        images: [{ src: "/images/gallery/bathroom-1.svg", captionKey: "bathroom.img1" }],
      },
      {
        id: "storage",
        images: [{ src: "/images/gallery/storage-1.svg", captionKey: "storage.img1" }],
      },
      {
        id: "details",
        images: [
          { src: "/images/gallery/details-1.svg", captionKey: "details.img1" },
          { src: "/images/gallery/details-2.svg", captionKey: "details.img2" },
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
