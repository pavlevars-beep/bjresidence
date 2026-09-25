"use client";

import { useState } from "react";
import { Field, inputClass, SectionCard, Toggle } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/info-point/SaveBar";
import { useSavePatch } from "@/components/admin/info-point/useSavePatch";
import { siteConfig } from "@/config/site";
import type { WebsiteSettings } from "@/lib/residence/types";

export function WebsiteContactEditor({ initial }: { initial: WebsiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const { status, save } = useSavePatch<Partial<WebsiteSettings>>("/api/admin/residence/website-settings", "PUT");

  function set<K extends keyof WebsiteSettings>(key: K, value: WebsiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <SectionCard
        title="Kontakt podaci"
        description={`Podrazumevano se koriste podaci iz koda (${siteConfig.contact.phoneDisplay}). Uključite override da ih promenite bez izmene koda.`}
        headerRight={<Toggle checked={settings.contactOverrideEnabled} onChange={(v) => set("contactOverrideEnabled", v)} label="Override" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input value={settings.phone} onChange={(e) => set("phone", e.target.value)} placeholder={siteConfig.contact.phoneDisplay} className={inputClass} disabled={!settings.contactOverrideEnabled} />
          </Field>
          <Field label="Email">
            <input value={settings.email} onChange={(e) => set("email", e.target.value)} placeholder={siteConfig.contact.email} className={inputClass} disabled={!settings.contactOverrideEnabled} />
          </Field>
          <Field label="WhatsApp (samo brojevi)">
            <input value={settings.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder={siteConfig.contact.whatsapp} className={inputClass} disabled={!settings.contactOverrideEnabled} />
          </Field>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save(settings)} />
    </div>
  );
}
