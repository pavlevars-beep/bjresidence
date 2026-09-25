import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { TransportEditor } from "@/components/admin/info-point/TransportEditor";

export default async function TransportPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <TransportEditor initialRoutes={config.transportRoutes} initialTaxis={config.taxiOptions} />;
}
