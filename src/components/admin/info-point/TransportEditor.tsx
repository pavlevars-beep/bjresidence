"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { TaxiOption, TransportRoute } from "@/lib/info-point";

function newRoute(): TransportRoute {
  return { id: crypto.randomUUID(), titleSr: "", titleEn: "", bodySr: "", bodyEn: "", mapsUrl: "", order: 0, enabled: true };
}
function newTaxi(): TaxiOption {
  return { id: crypto.randomUUID(), name: "", phone: "", url: "", description: "", order: 0, enabled: true };
}

export function TransportEditor({ initialRoutes, initialTaxis }: { initialRoutes: TransportRoute[]; initialTaxis: TaxiOption[] }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [taxis, setTaxis] = useState(initialTaxis);
  const { status, save } = useSavePatch();

  function updateRoute(id: string, patch: Partial<TransportRoute>) {
    setRoutes((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function removeRoute(id: string) {
    setRoutes((rs) => rs.filter((r) => r.id !== id));
  }
  function moveRoute(index: number, dir: -1 | 1) {
    setRoutes((rs) => {
      const sorted = [...rs].sort((a, b) => a.order - b.order);
      const target = index + dir;
      if (target < 0 || target >= sorted.length) return rs;
      [sorted[index], sorted[target]] = [sorted[target], sorted[index]];
      return sorted.map((r, i) => ({ ...r, order: i }));
    });
  }

  function updateTaxi(id: string, patch: Partial<TaxiOption>) {
    setTaxis((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  function removeTaxi(id: string) {
    setTaxis((ts) => ts.filter((t) => t.id !== id));
  }

  const sortedRoutes = [...routes].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard title="Linije prevoza" description="Autobuske linije i praktična uputstva ka centru/čvorištima.">
        <div className="flex flex-col gap-4">
          {sortedRoutes.map((route, i) => (
            <div key={route.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => moveRoute(i, -1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30">
                    <ChevronUp size={16} />
                  </button>
                  <button type="button" onClick={() => moveRoute(i, 1)} disabled={i === sortedRoutes.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={route.enabled} onChange={(v) => updateRoute(route.id, { enabled: v })} label="Vidljivo" />
                  <button type="button" onClick={() => removeRoute(route.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Naslov (SR)">
                  <input value={route.titleSr} onChange={(e) => updateRoute(route.id, { titleSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Naslov (EN)">
                  <input value={route.titleEn} onChange={(e) => updateRoute(route.id, { titleEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (SR)">
                  <textarea rows={2} value={route.bodySr} onChange={(e) => updateRoute(route.id, { bodySr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis (EN)">
                  <textarea rows={2} value={route.bodyEn} onChange={(e) => updateRoute(route.id, { bodyEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Google Maps URL" className="sm:col-span-2">
                  <input value={route.mapsUrl} onChange={(e) => updateRoute(route.id, { mapsUrl: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRoutes((rs) => [...rs, newRoute()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj liniju
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Taxi" description="Konfigurabilna lista taxi opcija — bez promovisanja nasumičnih operatera.">
        <div className="flex flex-col gap-4">
          {taxis.map((taxi) => (
            <div key={taxi.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Toggle checked={taxi.enabled} onChange={(v) => updateTaxi(taxi.id, { enabled: v })} label="Vidljivo" />
                <button type="button" onClick={() => removeTaxi(taxi.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Naziv">
                  <input value={taxi.name} onChange={(e) => updateTaxi(taxi.id, { name: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Telefon">
                  <input value={taxi.phone} onChange={(e) => updateTaxi(taxi.id, { phone: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Sajt/aplikacija URL">
                  <input value={taxi.url} onChange={(e) => updateTaxi(taxi.id, { url: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Opis">
                  <input value={taxi.description} onChange={(e) => updateTaxi(taxi.id, { description: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTaxis((ts) => [...ts, newTaxi()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj taxi
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ transportRoutes: routes, taxiOptions: taxis })} />
    </div>
  );
}
