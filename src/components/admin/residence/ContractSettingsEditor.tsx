"use client";

import { useState } from "react";
import { Field, inputClass, SectionCard } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/info-point/SaveBar";
import { useSavePatch } from "@/components/admin/info-point/useSavePatch";
import type { ContractSettings } from "@/lib/residence/types";

export function ContractSettingsEditor({ initial }: { initial: ContractSettings }) {
  const [settings, setSettings] = useState(initial);
  const { status, save } = useSavePatch<Partial<ContractSettings>>("/api/admin/residence/contract-settings", "PUT");

  function set<K extends keyof ContractSettings>(key: K, value: ContractSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="pb-24">
      <SectionCard title="Podaci o izdavaocu" description="Koristi se za popunjavanje {{landlord_*}} polja u ugovorima. Naziv i adresa objekta se već preuzimaju iz podešavanja sajta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naziv / ime izdavaoca"><input value={settings.landlordName} onChange={(e) => set("landlordName", e.target.value)} className={inputClass} /></Field>
          <Field label="MB / PIB"><input value={settings.landlordId} onChange={(e) => set("landlordId", e.target.value)} className={inputClass} /></Field>
          <Field label="Adresa izdavaoca" className="sm:col-span-2"><input value={settings.landlordAddress} onChange={(e) => set("landlordAddress", e.target.value)} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save(settings)} />
    </div>
  );
}
