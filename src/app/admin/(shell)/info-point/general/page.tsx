import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getInfoPointConfig } from "@/lib/info-point-store";
import { GeneralEditor } from "@/components/admin/info-point/GeneralEditor";

export default async function GeneralPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const config = await getInfoPointConfig();
  return (
    <GeneralEditor initialSettings={config.settings} initialCategories={config.categories} initialContact={config.contact} />
  );
}
