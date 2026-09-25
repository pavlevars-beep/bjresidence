import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { DeviceGuidesEditor } from "@/components/admin/info-point/DeviceGuidesEditor";

export default async function DeviceGuidesPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <DeviceGuidesEditor initial={config.deviceGuides} />;
}
