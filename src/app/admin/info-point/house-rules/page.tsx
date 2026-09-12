import { getInfoPointConfig } from "@/lib/info-point-store";
import { HouseRulesEditor } from "@/components/admin/info-point/HouseRulesEditor";

export default async function HouseRulesPage() {
  const config = await getInfoPointConfig();
  return <HouseRulesEditor initial={config.houseRules} />;
}
