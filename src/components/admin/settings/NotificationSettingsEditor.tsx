"use client";

import { useState } from "react";
import { SectionCard, Toggle } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/info-point/SaveBar";
import { useSavePatch } from "@/components/admin/info-point/useSavePatch";
import type { NotificationSettings } from "@/lib/residence/types";

export function NotificationSettingsEditor({ initial }: { initial: NotificationSettings }) {
  const [settings, setSettings] = useState(initial);
  const { status, save } = useSavePatch<Partial<NotificationSettings>>("/api/admin/residence/notification-settings", "PUT");

  function set<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <SectionCard title="Koja obaveštenja slati" description="Odnosi se na podsetnike o boravku (Telegram + ručno slanje iz Predstojeće odluke).">
        <div className="flex flex-col gap-4">
          <Toggle checked={settings.paymentReminder} onChange={(v) => set("paymentReminder", v)} label="Podsetnik za uplatu" />
          <Toggle checked={settings.stayContinuationDecision} onChange={(v) => set("stayContinuationDecision", v)} label="Odluka o nastavku boravka" />
          <Toggle checked={settings.expectedMoveOut} onChange={(v) => set("expectedMoveOut", v)} label="Očekivano iseljenje" />
          <Toggle checked={settings.overduePayment} onChange={(v) => set("overduePayment", v)} label="Zakasnela uplata" />
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save(settings)} />
    </div>
  );
}
