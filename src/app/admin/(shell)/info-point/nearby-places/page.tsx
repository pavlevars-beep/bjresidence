import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { NearbyPlacesEditor } from "@/components/admin/info-point/NearbyPlacesEditor";

export default async function NearbyPlacesPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <NearbyPlacesEditor initial={config.nearbyPlaces} />;
}
