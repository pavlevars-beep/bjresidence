import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { PrintCabinCard } from "@/components/admin/info-point/PrintCabinCard";

export const metadata: Metadata = {
  title: "BJ Residence — Cabin QR Card",
  robots: { index: false, follow: false },
};

// Deliberately NOT nested under /admin/info-point (which has its own nav
// chrome) — this route is meant to be printed cleanly, with nothing else on
// the page.
export default function InfoPointPrintPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }
  return <PrintCabinCard />;
}
