import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { EmergencyEditor } from "@/components/admin/info-point/EmergencyEditor";

export default async function EmergencyPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <EmergencyEditor initial={config.emergencyContacts} />;
}
