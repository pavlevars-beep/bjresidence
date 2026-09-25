import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SectionCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sistem — BJ Residence Admin", robots: { index: false, follow: false } };

const CHECKS: { label: string; envVar: string; note?: string }[] = [
  { label: "Admin lozinka", envVar: "ADMIN_PASSWORD" },
  { label: "Sesija admina", envVar: "ADMIN_SESSION_SECRET" },
  { label: "Trajno skladište (Vercel Blob)", envVar: "BLOB_READ_WRITE_TOKEN", note: "Bez ovoga se koristi lokalni fajl u razvoju." },
  { label: "Telegram bot", envVar: "TELEGRAM_BOT_TOKEN" },
  { label: "Telegram chat", envVar: "TELEGRAM_CHAT_ID" },
  { label: "Telegram webhook (komande)", envVar: "TELEGRAM_WEBHOOK_SECRET" },
  { label: "OCR pasoša — API ključ", envVar: "ANTHROPIC_API_KEY" },
  { label: "OCR pasoša — model", envVar: "ANTHROPIC_PASSPORT_MODEL" },
];

export default function SystemSettingsPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Sistem</h1>
        <p className="mt-1 text-sm text-ink/55">Provera da li su promenljive okruženja podešene — vrednosti se nikad ne prikazuju.</p>
      </div>

      <SectionCard title="Promenljive okruženja">
        <ul className="flex flex-col divide-y divide-ink/8">
          {CHECKS.map((c) => {
            const configured = !!process.env[c.envVar];
            return (
              <li key={c.envVar} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{c.label}</p>
                  <p className="text-xs text-ink/45">{c.envVar}{c.note ? ` — ${c.note}` : ""}</p>
                </div>
                {configured ? (
                  <span className="flex items-center gap-1 rounded-full bg-olive-dark/10 px-2.5 py-1 text-xs font-semibold text-olive-dark">
                    <Check size={13} /> Podešeno
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <X size={13} /> Nedostaje
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
