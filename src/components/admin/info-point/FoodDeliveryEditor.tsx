"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { FoodLink, FoodLinkType } from "@/lib/info-point";

const TYPES: FoodLinkType[] = ["delivery", "restaurant", "bakery", "other"];

function newLink(): FoodLink {
  return { id: crypto.randomUUID(), name: "", url: "", type: "delivery", descriptionSr: "", descriptionEn: "", order: 0, enabled: true };
}

export function FoodDeliveryEditor({ initial }: { initial: FoodLink[] }) {
  const [links, setLinks] = useState(initial);
  const { status, save } = useSavePatch();

  function update(id: string, patch: Partial<FoodLink>) {
    setLinks((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function remove(id: string) {
    setLinks((ls) => ls.filter((l) => l.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Hrana i dostava" description="Wolt, Glovo i druge korisne opcije.">
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <div key={link.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Toggle checked={link.enabled} onChange={(v) => update(link.id, { enabled: v })} label="Vidljivo" />
                <button type="button" onClick={() => remove(link.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Naziv">
                  <input value={link.name} onChange={(e) => update(link.id, { name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Tip">
                  <select value={link.type} onChange={(e) => update(link.id, { type: e.target.value as FoodLinkType })} className={inputClass}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="URL" className="sm:col-span-2">
                  <input value={link.url} onChange={(e) => update(link.id, { url: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (SR)">
                  <input value={link.descriptionSr} onChange={(e) => update(link.id, { descriptionSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (EN)">
                  <input value={link.descriptionEn} onChange={(e) => update(link.id, { descriptionEn: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLinks((ls) => [...ls, newLink()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj link
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ foodLinks: links })} />
    </div>
  );
}
