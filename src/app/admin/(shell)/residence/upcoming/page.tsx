import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getUpcoming, getAllStayDeadlines, getCleaningSchedule } from "@/lib/residence/derive";
import { getNotificationSettings } from "@/lib/residence/notification-settings-store";
import { SectionCard } from "@/components/admin/ui";
import { UpcomingDecisionsList } from "@/components/admin/residence/UpcomingDecisionsList";
import { AllStayDeadlinesList } from "@/components/admin/residence/AllStayDeadlinesList";
import { CleaningScheduleList } from "@/components/admin/residence/CleaningScheduleList";
import { SendReminderButton } from "@/components/admin/residence/SendReminderButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predstojeće odluke — BJ Residence Admin", robots: { index: false, follow: false } };

export default async function UpcomingPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const [upcoming, allDeadlines, cleaning, notificationSettings] = await Promise.all([
    getUpcoming(7),
    getAllStayDeadlines(),
    getCleaningSchedule(),
    getNotificationSettings(),
  ]);
  const notificationsEnabled =
    notificationSettings.paymentReminder || notificationSettings.stayContinuationDecision || notificationSettings.expectedMoveOut;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Predstojeće odluke</h1>
          <p className="mt-1 text-sm text-ink/55">Uplate, iseljenja, odluke o nastavku i čišćenje — sve unapred izračunato.</p>
        </div>
        <SendReminderButton notificationsEnabled={notificationsEnabled} />
      </div>

      <SectionCard title="Potrebna pažnja" description="Ono što je već hitno — u narednih 7 dana ili prošlo.">
        <UpcomingDecisionsList initial={upcoming} />
      </SectionCard>

      <SectionCard title="Svi aktivni boravci — rokovi" description="Rok za najavu (7 dana pre kraja perioda), kraj perioda i sledeća uplata, za svakog gosta, bez obzira koliko je daleko.">
        <AllStayDeadlinesList items={allDeadlines} />
      </SectionCard>

      <SectionCard title="Čišćenje" description="Promena posteljine i peškira na svakih 15 dana od useljenja — nije praćeno kao 'urađeno', samo izračunato.">
        <CleaningScheduleList items={cleaning} />
      </SectionCard>
    </div>
  );
}
