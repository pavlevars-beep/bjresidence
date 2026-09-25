"use client";

import { useState } from "react";
import { Field, inputClass, SectionCard, Toggle } from "@/components/admin/ui";
import { SaveBar } from "@/components/admin/info-point/SaveBar";
import { useSavePatch } from "@/components/admin/info-point/useSavePatch";
import type { WebsiteSettings } from "@/lib/residence/types";

export function WebsiteContentEditor({ initial }: { initial: WebsiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const { status, save } = useSavePatch<Partial<WebsiteSettings>>("/api/admin/residence/website-settings", "PUT");

  function set<K extends keyof WebsiteSettings>(key: K, value: WebsiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <SectionCard title="Cena i uslovi" description="Prikazuje se na javnom sajtu kada je uključeno.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mesečna cena"><input type="number" value={settings.monthlyPrice ?? ""} onChange={(e) => set("monthlyPrice", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></Field>
          <Field label="Depozit"><input type="number" value={settings.deposit ?? ""} onChange={(e) => set("deposit", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></Field>
          <Field label="Valuta"><input value={settings.currency} onChange={(e) => set("currency", e.target.value)} className={inputClass} /></Field>
          <Field label="Minimalan boravak"><input value={settings.minimumStayLabel} onChange={(e) => set("minimumStayLabel", e.target.value)} placeholder="npr. 1 mesec" className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Prijave" headerRight={<Toggle checked={settings.acceptingInquiries} onChange={(v) => set("acceptingInquiries", v)} label="Primamo upite" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tekst CTA dugmeta (SR)"><input value={settings.ctaTextSr} onChange={(e) => set("ctaTextSr", e.target.value)} className={inputClass} /></Field>
          <Field label="CTA button text (EN)"><input value={settings.ctaTextEn} onChange={(e) => set("ctaTextEn", e.target.value)} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Objava na sajtu" headerRight={<Toggle checked={settings.announcementEnabled} onChange={(v) => set("announcementEnabled", v)} label="Prikaži objavu" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tekst objave (SR)"><textarea value={settings.announcementTextSr} onChange={(e) => set("announcementTextSr", e.target.value)} rows={2} className={inputClass} /></Field>
          <Field label="Announcement text (EN)"><textarea value={settings.announcementTextEn} onChange={(e) => set("announcementTextEn", e.target.value)} rows={2} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Promotivni tekst i istaknuta napomena">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Promo tekst (SR)"><input value={settings.promoTextSr} onChange={(e) => set("promoTextSr", e.target.value)} className={inputClass} /></Field>
          <Field label="Promo text (EN)"><input value={settings.promoTextEn} onChange={(e) => set("promoTextEn", e.target.value)} className={inputClass} /></Field>
          <Field label="Istaknuta napomena (SR)"><input value={settings.featuredNoticeSr} onChange={(e) => set("featuredNoticeSr", e.target.value)} className={inputClass} /></Field>
          <Field label="Featured notice (EN)"><input value={settings.featuredNoticeEn} onChange={(e) => set("featuredNoticeEn", e.target.value)} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save(settings)} />
    </div>
  );
}
