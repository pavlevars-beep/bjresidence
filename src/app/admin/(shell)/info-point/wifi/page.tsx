import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { WifiEditor } from "@/components/admin/info-point/WifiEditor";

export default async function WifiPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <WifiEditor initial={config.wifi} />;
}
