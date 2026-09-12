import { getInfoPointConfig } from "@/lib/info-point-store";
import { WifiEditor } from "@/components/admin/info-point/WifiEditor";

export default async function WifiPage() {
  const config = await getInfoPointConfig();
  return <WifiEditor initial={config.wifi} />;
}
