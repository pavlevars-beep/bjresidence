import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getUpcoming } from "@/lib/residence/derive";
import { getNotificationSettings } from "@/lib/residence/notification-settings-store";
import { SectionCard } from "@/components/admin/ui";
import { UpcomingDecisionsList } from "@/components/admin/residence/UpcomingDecisionsList";
import { SendReminderButton } from "@/components/admin/residence/SendReminderButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predstojeće odluke — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function UpcomingPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [upcoming, notificationSettings] = await Promise.all([getUpcoming(7), getNotificationSettings()]);
  const notificationsEnabled =
    notificationSettings.paymentReminder || notificationSettings.stayContinuationDecision || notificationSettings.expectedMoveOut;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Predstojeće odluke</h1>
          <p className="mt-1 text-sm text-ink/55">Uplate, iseljenja i odluke o nastavku boravka u narednih 7 dana.</p>
        </div>
        <SendReminderButton notificationsEnabled={notificationsEnabled} />
      </div>

      <SectionCard title="Potrebna pažnja">
        <UpcomingDecisionsList initial={upcoming} />
      </SectionCard>
    </div>
  );
}
