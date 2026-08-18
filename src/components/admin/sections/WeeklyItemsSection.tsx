import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { WeeklyItem } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

function newItem(): WeeklyItem {
  return {
    id: crypto.randomUUID(),
    date: "",
    time: "",
    titleSr: "",
    titleEn: "",
    descriptionSr: "",
    descriptionEn: "",
    visible: true,
    priority: 0,
  };
}

export function WeeklyItemsSection({
  value,
  onChange,
}: {
  value: WeeklyItem[];
  onChange: (next: WeeklyItem[]) => void;
}) {
  function updateItem(id: string, patch: Partial<WeeklyItem>) {
    onChange(value.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    onChange(value.filter((it) => it.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((it, i) => ({ ...it, priority: i })));
  }

  return (
    <SectionCard title="Ove nedelje" description="Prikazuje se do 4 vidljive stavke, sortirane po redosledu ispod.">
      <div className="flex flex-col gap-4">
        {value.length === 0 && <p className="text-sm text-ink/40">Nema stavki. Dodajte prvu ispod.</p>}

        {value.map((item, i) => (
          <div key={item.id} className="rounded-2xl border border-ink/10 bg-white p-4">
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
                <Toggle checked={item.visible} onChange={(v) => updateItem(item.id, { visible: v })} label="Vidljivo" />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-700/70 hover:bg-red-50"
                  aria-label="Obriši"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Field label="Datum">
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => updateItem(item.id, { date: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Vreme (opciono)">
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => updateItem(item.id, { time: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Naslov (SR)">
                <input
                  type="text"
                  value={item.titleSr}
                  onChange={(e) => updateItem(item.id, { titleSr: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Naslov (EN)">
                <input
                  type="text"
                  value={item.titleEn}
                  onChange={(e) => updateItem(item.id, { titleEn: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange([...value, newItem()])}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink/60 hover:border-olive-dark hover:text-olive-dark"
        >
          <Plus size={16} /> Dodaj stavku
        </button>
      </div>
    </SectionCard>
  );
}
