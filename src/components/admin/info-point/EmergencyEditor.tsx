"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { EmergencyContact } from "@/lib/info-point";

function newContact(): EmergencyContact {
  return { id: crypto.randomUUID(), labelSr: "", labelEn: "", phone: "", order: 0, highlight: false };
}

export function EmergencyEditor({ initial }: { initial: EmergencyContact[] }) {
  const [contacts, setContacts] = useState(initial);
  const { status, save } = useSavePatch();

  function update(id: string, patch: Partial<EmergencyContact>) {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function remove(id: string) {
    setContacts((cs) => cs.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard
        title="Hitni brojevi"
        description="Proverite zvanične brojeve pre objavljivanja (policija, hitna pomoć, vatrogasci su unapred popunjeni na osnovu javno dostupnih zvaničnih brojeva u Srbiji)."
      >
        <div className="flex flex-col gap-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <Toggle checked={c.highlight} onChange={(v) => update(c.id, { highlight: v })} label="Istaknuto (crveno)" />
                <button type="button" onClick={() => remove(c.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Naziv (SR)">
                  <input value={c.labelSr} onChange={(e) => update(c.id, { labelSr: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Naziv (EN)">
                  <input value={c.labelEn} onChange={(e) => update(c.id, { labelEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Broj telefona">
                  <input value={c.phone} onChange={(e) => update(c.id, { phone: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContacts((cs) => [...cs, newContact()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
          >
            <Plus size={16} /> Dodaj broj
          </button>
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ emergencyContacts: contacts })} />
    </div>
  );
}
