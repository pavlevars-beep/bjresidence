"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/info-point", label: "Dashboard" },
  { href: "/admin/info-point/general", label: "General" },
  { href: "/admin/info-point/wifi", label: "Wi-Fi" },
  { href: "/admin/info-point/house-rules", label: "House Rules" },
  { href: "/admin/info-point/nearby-places", label: "Nearby Places" },
  { href: "/admin/info-point/device-guides", label: "Device Guides" },
  { href: "/admin/info-point/transport", label: "Transport" },
  { href: "/admin/info-point/food-delivery", label: "Food & Delivery" },
  { href: "/admin/info-point/work-destinations", label: "Work Destinations" },
  { href: "/admin/info-point/emergency", label: "Emergency" },
  { href: "/admin/info-point/issue-reports", label: "Issue Reports" },
  { href: "/admin/info-point/qr-codes", label: "QR Codes" },
  { href: "/admin/info-point/appearance", label: "Appearance" },
];

export function InfoPointAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto px-5 pb-1 pt-4 sm:px-8">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin/info-point" ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-olive-dark text-cream" : "text-ink/55 hover:bg-ink/5"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
