import { getInfoPointConfig } from "@/lib/info-point-store";
import { EmergencyEditor } from "@/components/admin/info-point/EmergencyEditor";

export default async function EmergencyPage() {
  const config = await getInfoPointConfig();
  return <EmergencyEditor initial={config.emergencyContacts} />;
}
