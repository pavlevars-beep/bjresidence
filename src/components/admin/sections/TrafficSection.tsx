import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { TrafficDestination } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

function newDestination(): TrafficDestination {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    nameSr: "",
    nameEn: "",
    destination: "",
    fallbackMinutes: 20,
    order: 0,
  };
}

export function TrafficSection({
  value,
  onChange,
}: {
  value: TrafficDestination[];
  onChange: (next: TrafficDestination[]) => void;
}) {
  function update(id: string, patch: Partial<TrafficDestination>) {
    onChange(value.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function remove(id: string) {
    onChange(value.filter((d) => d.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((d, i) => ({ ...d, order: i })));
  }

  return (
    <SectionCard
      title="Saobraćaj sada"
      description="Ako GOOGLE_MAPS_API_KEY nije podešen, prikazuje se procenjeno vreme ispod."
    >
      <div className="flex flex-col gap-4">
        {value.map((d, i) => (
          <div key={d.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                  aria-label="Pomeri gore"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                  aria-label="Pomeri dole"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={d.enabled} onChange={(v) => update(d.id, { enabled: v })} label="Uključeno" />
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50"
                  aria-label="Obriši"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Field label="Naziv (SR)">
                <input type="text" value={d.nameSr} onChange={(e) => update(d.id, { nameSr: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Naziv (EN)">
                <input type="text" value={d.nameEn} onChange={(e) => update(d.id, { nameEn: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Odredište (adresa)">
                <input
                  type="text"
                  value={d.destination}
                  onChange={(e) => update(d.id, { destination: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Procena (min)">
                <input
                  type="number"
                  min={1}
                  value={d.fallbackMinutes ?? ""}
                  onChange={(e) => update(d.id, { fallbackMinutes: e.target.value ? Number(e.target.value) : null })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange([...value, newDestination()])}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
        >
          <Plus size={16} /> Dodaj odredište
        </button>
      </div>
    </SectionCard>
  );
}
