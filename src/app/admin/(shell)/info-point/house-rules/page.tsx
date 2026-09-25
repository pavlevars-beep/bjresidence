import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { HouseRulesEditor } from "@/components/admin/info-point/HouseRulesEditor";

export default async function HouseRulesPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return <HouseRulesEditor initial={config.houseRules} />;
}
