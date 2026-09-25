import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getNotificationSettings } from "@/lib/residence/notification-settings-store";
import { NotificationSettingsEditor } from "@/components/admin/settings/NotificationSettingsEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Obaveštenja — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function NotificationsSettingsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const settings = await getNotificationSettings();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Obaveštenja</h1>
      </div>
      <NotificationSettingsEditor initial={settings} />
    </div>
  );
}
