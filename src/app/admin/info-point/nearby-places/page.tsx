import { getInfoPointConfig } from "@/lib/info-point-store";
import { NearbyPlacesEditor } from "@/components/admin/info-point/NearbyPlacesEditor";

export default async function NearbyPlacesPage() {
  const config = await getInfoPointConfig();
  return <NearbyPlacesEditor initial={config.nearbyPlaces} />;
}
