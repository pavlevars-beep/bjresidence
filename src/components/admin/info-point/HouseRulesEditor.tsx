"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import { ICONS } from "../../info-point/icon-map";
import type { HouseRules, HouseRuleSection } from "@/lib/info-point";

function newSection(): HouseRuleSection {
  return {
    id: crypto.randomUUID(),
    titleSr: "",
    titleEn: "",
    bodySr: "",
    bodyEn: "",
    icon: "Sparkles",
    order: 0,
    enabled: true,
  };
}

export function HouseRulesEditor({ initial }: { initial: HouseRules }) {
  const [houseRules, setHouseRules] = useState(initial);
  const { status, save } = useSavePatch();

  function updateSection(id: string, patch: Partial<HouseRuleSection>) {
    setHouseRules((hr) => ({ ...hr, sections: hr.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  }
  function removeSection(id: string) {
    setHouseRules((hr) => ({ ...hr, sections: hr.sections.filter((s) => s.id !== id) }));
  }
  function move(index: number, dir: -1 | 1) {
    setHouseRules((hr) => {
      const sorted = [...hr.sections].sort((a, b) => a.order - b.order);
      const target = index + dir;
      if (target < 0 || target >= sorted.length) return hr;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return { ...hr, sections: sorted.map((s, i) => ({ ...s, order: i })) };
    });
  }

  const sortedSections = [...houseRules.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Kratak rezime" description="Prikazuje se na vrhu Kućnog reda.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rezime (SR)">
            <textarea
              rows={3}
              value={houseRules.summarySr}
              onChange={(e) => setHouseRules((hr) => ({ ...hr, summarySr: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Rezime (EN)">
            <textarea
              rows={3}
              value={houseRules.summaryEn}
              onChange={(e) => setHouseRules((hr) => ({ ...hr, summaryEn: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Stavke kućnog reda" description="Redosled, ikonica i tekst svake stavke.">
        <div className="flex flex-col gap-4">
          {sortedSections.map((section, i) => (
            <div key={section.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === sortedSections.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={section.enabled} onChange={(v) => updateSection(section.id, { enabled: v })} label="Vidljivo" />
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Ikonica">
                  <select
                    value={section.icon}
                    onChange={(e) => updateSection(section.id, { icon: e.target.value })}
                    className={inputClass}
                  >
                    {Object.keys(ICONS).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div />
                <Field label="Naslov (SR)">
                  <input value={section.titleSr} onChange={(e) => updateSection(section.id, { titleSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Naslov (EN)">
                  <input value={section.titleEn} onChange={(e) => updateSection(section.id, { titleEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Tekst (SR)">
                  <textarea rows={2} value={section.bodySr} onChange={(e) => updateSection(section.id, { bodySr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Tekst (EN)">
                  <textarea rows={2} value={section.bodyEn} onChange={(e) => updateSection(section.id, { bodyEn: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setHouseRules((hr) => ({ ...hr, sections: [...hr.sections, newSection()] }))}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj stavku
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ houseRules })} />
    </div>
  );
}
