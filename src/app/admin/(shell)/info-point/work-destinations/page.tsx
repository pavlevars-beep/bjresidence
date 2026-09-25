import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { WorkDestinationsEditor } from "@/components/admin/info-point/WorkDestinationsEditor";

export default async function WorkDestinationsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <WorkDestinationsEditor initial={config.workDestinations} />;
}
