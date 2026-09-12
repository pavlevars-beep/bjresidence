import { getInfoPointConfig } from "@/lib/info-point-store";
import { TransportEditor } from "@/components/admin/info-point/TransportEditor";

export default async function TransportPage() {
  const config = await getInfoPointConfig();
  return <TransportEditor initialRoutes={config.transportRoutes} initialTaxis={config.taxiOptions} />;
}
