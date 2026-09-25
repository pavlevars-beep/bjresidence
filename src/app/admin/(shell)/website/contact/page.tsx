import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getWebsiteSettings } from "@/lib/residence/website-settings-store";
import { WebsiteContactEditor } from "@/components/admin/website/WebsiteContactEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kontakt — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function WebsiteContactPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const settings = await getWebsiteSettings();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Kontakt i podaci o smeštaju</h1>
      </div>
      <WebsiteContactEditor initial={settings} />
    </div>
  );
}
