import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { FoodDeliveryEditor } from "@/components/admin/info-point/FoodDeliveryEditor";

export default async function FoodDeliveryPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <FoodDeliveryEditor initial={config.foodLinks} />;
}
