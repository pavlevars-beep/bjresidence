/** Single source of truth for the grouped admin nav (AdminShell + Dashboard hub). */

export interface AdminNavLink {
  href: string;
  label: string;
}

export interface AdminNavGroup {
  label: string;
  links: AdminNavLink[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Website",
    links: [
      { href: "/admin/website/availability", label: "Dostupnost" },
      { href: "/admin/website/content", label: "Sadržaj sajta" },
      { href: "/admin/website/contact", label: "Kontakt i podaci" },
    ],
  },
  {
    label: "Info sistem",
    links: [
      { href: "/admin/info-board", label: "Info tabla" },
      { href: "/admin/info-point", label: "Info Point" },
      { href: "/admin/info-point/qr-codes", label: "QR kodovi" },
    ],
  },
  {
    label: "Upravljanje smeštajem",
    links: [
      { href: "/admin/residence", label: "Pregled" },
      { href: "/admin/residence/cabins", label: "Kabine" },
      { href: "/admin/residence/residents", label: "Gosti" },
      { href: "/admin/residence/payments", label: "Uplate" },
      { href: "/admin/residence/deposits", label: "Depoziti" },
      { href: "/admin/residence/reservations", label: "Rezervacije" },
      { href: "/admin/residence/upcoming", label: "Predstojeće odluke" },
      { href: "/admin/residence/documents", label: "Dokumenta" },
      { href: "/admin/residence/stay-history", label: "Istorija boravaka" },
      { href: "/admin/residence/contract-templates", label: "Šabloni ugovora" },
    ],
  },
  {
    label: "Podešavanja",
    links: [
      { href: "/admin/settings/telegram", label: "Telegram" },
      { href: "/admin/settings/notifications", label: "Obaveštenja" },
      { href: "/admin/settings/system", label: "Sistem" },
    ],
  },
];
