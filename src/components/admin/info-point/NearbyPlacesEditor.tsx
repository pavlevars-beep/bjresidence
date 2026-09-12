"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { NearbyPlace, NearbyPlaceCategory } from "@/lib/info-point";

const CATEGORIES: NearbyPlaceCategory[] = ["supermarket", "pharmacy", "atm", "health", "food", "other"];

function newPlace(): NearbyPlace {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "other",
    image: "",
    address: "",
    walkMinutes: null,
    hours: "",
    phone: "",
    mapsUrl: "",
    lat: null,
    lng: null,
    descriptionSr: "",
    descriptionEn: "",
    featured: false,
    visible: true,
    order: 0,
  };
}

export function NearbyPlacesEditor({ initial }: { initial: NearbyPlace[] }) {
  const [places, setPlaces] = useState(initial);
  const { status, save } = useSavePatch();

  function update(id: string, patch: Partial<NearbyPlace>) {
    setPlaces((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function remove(id: string) {
    setPlaces((ps) => ps.filter((p) => p.id !== id));
  }
  function move(index: number, dir: -1 | 1) {
    setPlaces((ps) => {
      const sorted = [...ps].sort((a, b) => a.order - b.order);
      const target = index + dir;
      if (target < 0 || target >= sorted.length) return ps;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return sorted.map((p, i) => ({ ...p, order: i }));
    });
  }

  const sorted = [...places].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Lokacije u blizini" description="Prodavnice, apoteke, bankomati, zdravstvo, hrana i ostalo.">
        <div className="flex flex-col gap-4">
          {sorted.map((place, i) => (
            <div key={place.id} className="rounded-2xl border border-ink/10 bg-white p-4">
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
                  <Toggle checked={place.featured} onChange={(v) => update(place.id, { featured: v })} label="Izdvojeno" />
                  <Toggle checked={place.visible} onChange={(v) => update(place.id, { visible: v })} label="Vidljivo" />
                  <button type="button" onClick={() => remove(place.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Naziv">
                  <input value={place.name} onChange={(e) => update(place.id, { name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Kategorija">
                  <select value={place.category} onChange={(e) => update(place.id, { category: e.target.value as NearbyPlaceCategory })} className={inputClass}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Hodanje (min)">
                  <input
                    type="number"
                    value={place.walkMinutes ?? ""}
                    onChange={(e) => update(place.id, { walkMinutes: e.target.value === "" ? null : Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Adresa" className="sm:col-span-2">
                  <input value={place.address} onChange={(e) => update(place.id, { address: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Telefon">
                  <input value={place.phone} onChange={(e) => update(place.id, { phone: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Radno vreme" className="sm:col-span-2">
                  <input value={place.hours} onChange={(e) => update(place.id, { hours: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Google Maps URL">
                  <input value={place.mapsUrl} onChange={(e) => update(place.id, { mapsUrl: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Slika (URL, opciono)">
                  <input value={place.image} onChange={(e) => update(place.id, { image: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Lat (opciono)">
                  <input
                    type="number"
                    value={place.lat ?? ""}
                    onChange={(e) => update(place.id, { lat: e.target.value === "" ? null : Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Lng (opciono)">
                  <input
                    type="number"
                    value={place.lng ?? ""}
                    onChange={(e) => update(place.id, { lng: e.target.value === "" ? null : Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Opis (SR)" className="sm:col-span-3">
                  <textarea rows={2} value={place.descriptionSr} onChange={(e) => update(place.id, { descriptionSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (EN)" className="sm:col-span-3">
                  <textarea rows={2} value={place.descriptionEn} onChange={(e) => update(place.id, { descriptionEn: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setPlaces((ps) => [...ps, newPlace()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj lokaciju
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ nearbyPlaces: places })} />
    </div>
  );
}
