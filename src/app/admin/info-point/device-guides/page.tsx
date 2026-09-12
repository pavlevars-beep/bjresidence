import { getInfoPointConfig } from "@/lib/info-point-store";
import { DeviceGuidesEditor } from "@/components/admin/info-point/DeviceGuidesEditor";

export default async function DeviceGuidesPage() {
  const config = await getInfoPointConfig();
  return <DeviceGuidesEditor initial={config.deviceGuides} />;
}
