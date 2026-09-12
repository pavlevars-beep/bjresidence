"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { ContactInfo, InfoPointCategory, InfoPointSettings } from "@/lib/info-point";

export function GeneralEditor({
  initialSettings,
  initialCategories,
  initialContact,
}: {
  initialSettings: InfoPointSettings;
  initialCategories: InfoPointCategory[];
  initialContact: ContactInfo;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [categories, setCategories] = useState(initialCategories);
  const [contact, setContact] = useState(initialContact);
  const { status, save } = useSavePatch();

  const setS = <K extends keyof InfoPointSettings>(key: K, v: InfoPointSettings[K]) => setSettings((s) => ({ ...s, [key]: v }));
  const setC = <K extends keyof ContactInfo>(key: K, v: ContactInfo[K]) => setContact((c) => ({ ...c, [key]: v }));

  function toggleCategory(key: InfoPointCategory["key"]) {
    setCategories((cats) => cats.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c)));
  }

  function moveCategory(index: number, dir: -1 | 1) {
    setCategories((cats) => {
      const sorted = [...cats].sort((a, b) => a.order - b.order);
      const target = index + dir;
      if (target < 0 || target >= sorted.length) return cats;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return sorted.map((c, i) => ({ ...c, order: i }));
    });
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Naslov i podnaslov" description="Prikazuje se na vrhu Info Point stranice.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naslov (SR)">
            <input value={settings.heroTitleSr} onChange={(e) => setS("heroTitleSr", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Naslov (EN)">
            <input value={settings.heroTitleEn} onChange={(e) => setS("heroTitleEn", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Podnaslov (SR)">
            <input value={settings.heroSubtitleSr} onChange={(e) => setS("heroSubtitleSr", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Podnaslov (EN)">
            <input value={settings.heroSubtitleEn} onChange={(e) => setS("heroSubtitleEn", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Moduli" description="Uključite/isključite i poređajte redosled modula na Info Point stranici.">
        <div className="flex flex-col gap-2.5">
          {sortedCategories.map((cat, i) => (
            <div key={cat.key} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveCategory(i, -1)}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(i, 1)}
                  disabled={i === sortedCategories.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
              <span className="flex-1 text-sm font-medium text-ink">
                {cat.titleSr} <span className="text-ink/40">/ {cat.titleEn}</span>
              </span>
              <Toggle checked={cat.enabled} onChange={() => toggleCategory(cat.key)} label="" />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Kontakt BJ Residence" description="Prikazuje se u sekciji 'Kontakt BJ Residence' na Info Point stranici.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input value={contact.phone} onChange={(e) => setC("phone", e.target.value)} className={inputClass} />
          </Field>
          <Field label="WhatsApp (samo brojevi)">
            <input value={contact.whatsapp} onChange={(e) => setC("whatsapp", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Viber (opciono)">
            <input value={contact.viber} onChange={(e) => setC("viber", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email">
            <input value={contact.email} onChange={(e) => setC("email", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ime upravnika (opciono)">
            <input value={contact.managerName} onChange={(e) => setC("managerName", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Adresa">
            <input value={contact.address} onChange={(e) => setC("address", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Google Maps URL" className="sm:col-span-2">
            <input value={contact.mapsUrl} onChange={(e) => setC("mapsUrl", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ settings, categories, contact })} />
    </div>
  );
}
