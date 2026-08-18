import type { QrSettings } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

export function QrSection({ value, onChange }: { value: QrSettings; onChange: (next: QrSettings) => void }) {
  const set = <K extends keyof QrSettings>(key: K, v: QrSettings[K]) => onChange({ ...value, [key]: v });

  return (
    <SectionCard
      title="QR kod"
      description="Generiše se automatski od unetog linka."
      headerRight={<Toggle checked={value.enabled} onChange={(v) => set("enabled", v)} label="Uključeno" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL" className="sm:col-span-2">
          <input
            type="url"
            value={value.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://bjresidence.rs"
            className={inputClass}
          />
        </Field>
        <Field label="Oznaka (SR)">
          <input type="text" value={value.labelSr} onChange={(e) => set("labelSr", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Oznaka (EN)">
          <input type="text" value={value.labelEn} onChange={(e) => set("labelEn", e.target.value)} className={inputClass} />
        </Field>
      </div>
    </SectionCard>
  );
}
