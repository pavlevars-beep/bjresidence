import { getInfoPointConfig } from "@/lib/info-point-store";
import { WorkDestinationsEditor } from "@/components/admin/info-point/WorkDestinationsEditor";

export default async function WorkDestinationsPage() {
  const config = await getInfoPointConfig();
  return <WorkDestinationsEditor initial={config.workDestinations} />;
}
