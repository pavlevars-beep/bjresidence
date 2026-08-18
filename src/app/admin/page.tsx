import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getInfoBoardConfig } from "@/lib/info-board-store";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "BJ Residence — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoBoardConfig();
  return <AdminDashboard initialConfig={config} />;
}
