"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { WorkDestination } from "@/lib/info-point";

function newDestination(): WorkDestination {
  return {
    id: crypto.randomUUID(),
    companyName: "",
    address: "",
    instructionsSr: "",
    instructionsEn: "",
    mapsUrl: "",
    transportMode: "",
    estimatedMinutes: null,
    notes: "",
    order: 0,
    enabled: true,
  };
}

export function WorkDestinationsEditor({ initial }: { initial: WorkDestination[] }) {
  const [destinations, setDestinations] = useState(initial);
  const { status, save } = useSavePatch();

  function update(id: string, patch: Partial<WorkDestination>) {
    setDestinations((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }
  function remove(id: string) {
    setDestinations((ds) => ds.filter((d) => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard
        title="Kako do posla"
        description="Destinacije poslodavaca koji iznajmljuju smeštaj za svoje zaposlene — svaka sa sopstvenim uputstvom."
      >
        <div className="flex flex-col gap-4">
          {destinations.length === 0 && (
            <p className="text-sm text-ink/40">Nema podešenih destinacija. Dodajte prvu ispod.</p>
          )}
          {destinations.map((dest) => (
            <div key={dest.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Toggle checked={dest.enabled} onChange={(v) => update(dest.id, { enabled: v })} label="Vidljivo" />
                <button type="button" onClick={() => remove(dest.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Naziv kompanije">
                  <input value={dest.companyName} onChange={(e) => update(dest.id, { companyName: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Adresa">
                  <input value={dest.address} onChange={(e) => update(dest.id, { address: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Uputstvo (SR)">
                  <textarea rows={2} value={dest.instructionsSr} onChange={(e) => update(dest.id, { instructionsSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Uputstvo (EN)">
                  <textarea rows={2} value={dest.instructionsEn} onChange={(e) => update(dest.id, { instructionsEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Google Maps URL" className="sm:col-span-2">
                  <input value={dest.mapsUrl} onChange={(e) => update(dest.id, { mapsUrl: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Preporučeni prevoz">
                  <input value={dest.transportMode} onChange={(e) => update(dest.id, { transportMode: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Procenjeno vreme (min)">
                  <input
                    type="number"
                    value={dest.estimatedMinutes ?? ""}
                    onChange={(e) => update(dest.id, { estimatedMinutes: e.target.value === "" ? null : Number(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Napomena" className="sm:col-span-2">
                  <input value={dest.notes} onChange={(e) => update(dest.id, { notes: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDestinations((ds) => [...ds, newDestination()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj destinaciju
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ workDestinations: destinations })} />
    </div>
  );
}
