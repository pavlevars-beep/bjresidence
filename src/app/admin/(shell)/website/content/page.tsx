import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getWebsiteSettings } from "@/lib/residence/website-settings-store";
import { WebsiteContentEditor } from "@/components/admin/website/WebsiteContentEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sadržaj sajta — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function WebsiteContentPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const settings = await getWebsiteSettings();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Sadržaj sajta</h1>
        <p className="mt-1 text-sm text-ink/55">Operativne informacije koje se povremeno menjaju — ne ceo sadržaj sajta.</p>
      </div>
      <WebsiteContentEditor initial={settings} />
    </div>
  );
}
