"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { DeviceGuide } from "@/lib/info-point";

function newGuide(): DeviceGuide {
  return {
    id: crypto.randomUUID(),
    titleSr: "",
    titleEn: "",
    image: "",
    descriptionSr: "",
    descriptionEn: "",
    stepsSr: [],
    stepsEn: [],
    warningSr: "",
    warningEn: "",
    videoUrl: "",
    order: 0,
    enabled: true,
  };
}

const linesToSteps = (text: string) => text.split("\n").map((s) => s.trim()).filter(Boolean);

export function DeviceGuidesEditor({ initial }: { initial: DeviceGuide[] }) {
  const [guides, setGuides] = useState(initial);
  const { status, save } = useSavePatch();

  function update(id: string, patch: Partial<DeviceGuide>) {
    setGuides((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }
  function remove(id: string) {
    setGuides((gs) => gs.filter((g) => g.id !== id));
  }
  function move(index: number, dir: -1 | 1) {
    setGuides((gs) => {
      const sorted = [...gs].sort((a, b) => a.order - b.order);
      const target = index + dir;
      if (target < 0 || target >= sorted.length) return gs;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return sorted.map((g, i) => ({ ...g, order: i }));
    });
  }

  const sorted = [...guides].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Uputstva za uređaje" description="Klima, TV, šporet, frižider, bojler, info tabla, itd.">
        <div className="flex flex-col gap-4">
          {sorted.map((guide, i) => (
            <div key={guide.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30">
                    <ChevronUp size={16} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sorted.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={guide.enabled} onChange={(v) => update(guide.id, { enabled: v })} label="Vidljivo" />
                  <button type="button" onClick={() => remove(guide.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Naslov (SR)">
                  <input value={guide.titleSr} onChange={(e) => update(guide.id, { titleSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Naslov (EN)">
                  <input value={guide.titleEn} onChange={(e) => update(guide.id, { titleEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Slika (URL, opciono)" className="sm:col-span-2">
                  <input value={guide.image} onChange={(e) => update(guide.id, { image: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (SR)">
                  <textarea rows={2} value={guide.descriptionSr} onChange={(e) => update(guide.id, { descriptionSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (EN)">
                  <textarea rows={2} value={guide.descriptionEn} onChange={(e) => update(guide.id, { descriptionEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Koraci (SR) — jedan po redu">
                  <textarea
                    rows={4}
                    value={guide.stepsSr.join("\n")}
                    onChange={(e) => update(guide.id, { stepsSr: linesToSteps(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Koraci (EN) — jedan po redu">
                  <textarea
                    rows={4}
                    value={guide.stepsEn.join("\n")}
                    onChange={(e) => update(guide.id, { stepsEn: linesToSteps(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Napomena (SR, opciono)">
                  <input value={guide.warningSr} onChange={(e) => update(guide.id, { warningSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Napomena (EN, opciono)">
                  <input value={guide.warningEn} onChange={(e) => update(guide.id, { warningEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Video URL (opciono)" className="sm:col-span-2">
                  <input value={guide.videoUrl} onChange={(e) => update(guide.id, { videoUrl: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setGuides((gs) => [...gs, newGuide()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj uputstvo
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ deviceGuides: guides })} />
    </div>
  );
}
