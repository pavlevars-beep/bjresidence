import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SectionCard } from "@/components/admin/ui";
import { TelegramTestButton } from "@/components/admin/settings/TelegramTestButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Telegram — BJ Residence Admin", robots: { index: false, follow: false } };

export default function TelegramSettingsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const configured = !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID;
  const webhookConfigured = !!process.env.TELEGRAM_WEBHOOK_SECRET;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Telegram</h1>
      </div>

      <SectionCard title="Status veze">
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-ink/70">
            Bot: <span className={configured ? "font-semibold text-olive-dark" : "font-semibold text-red-700"}>{configured ? "Podešen" : "Nije podešen"}</span>
          </p>
          <p className="text-ink/70">
            Webhook (komande poput /dostupnost): <span className={webhookConfigured ? "font-semibold text-olive-dark" : "font-semibold text-red-700"}>{webhookConfigured ? "Podešen" : "Nije podešen"}</span>
          </p>
        </div>
        <div className="mt-4">
          <TelegramTestButton configured={configured} />
        </div>
      </SectionCard>

      <SectionCard title="Kako radi" description="Trenutno stanje sistema obaveštenja.">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/70">
          <li>Prijave o kvarovima i upiti sa sajta se odmah šalju na Telegram.</li>
          <li>
            Podsetnici za istek plaćenog perioda boravka šalju se automatski jednom dnevno (Vercel Cron, oko
            07:00 UTC) i mogu se pokrenuti i ručno iz Predstojeće odluke (dugme &quot;Pošalji podsetnike&quot;) — obe
            putanje dele istu logiku, tako da se ista poruka nikad ne šalje dvaput za isti period.
          </li>
          <li>Dnevni automatski posao radi samo ako je <code>CRON_SECRET</code> podešen (vidi Sistem).</li>
        </ul>
      </SectionCard>
    </div>
  );
}
