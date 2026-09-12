import { getInfoPointConfig } from "@/lib/info-point-store";
import { FoodDeliveryEditor } from "@/components/admin/info-point/FoodDeliveryEditor";

export default async function FoodDeliveryPage() {
  const config = await getInfoPointConfig();
  return <FoodDeliveryEditor initial={config.foodLinks} />;
}
