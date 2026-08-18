import type { Announcement } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

export function AnnouncementSection({
  value,
  onChange,
}: {
  value: Announcement;
  onChange: (next: Announcement) => void;
}) {
  const set = <K extends keyof Announcement>(key: K, v: Announcement[K]) => onChange({ ...value, [key]: v });

  return (
    <SectionCard
      title="Važna informacija"
      description="Prikazuje se kao istaknuta traka na /infopult dok je aktivna."
      headerRight={<Toggle checked={value.enabled} onChange={(v) => set("enabled", v)} label="Uključeno" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naslov (SR)">
          <input type="text" value={value.titleSr} onChange={(e) => set("titleSr", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Naslov (EN)">
          <input type="text" value={value.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Tekst (SR)" className="sm:col-span-2">
          <textarea
            rows={2}
            value={value.textSr}
            onChange={(e) => set("textSr", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tekst (EN)" className="sm:col-span-2">
          <textarea
            rows={2}
            value={value.textEn}
            onChange={(e) => set("textEn", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Aktivno od (opciono)">
          <input
            type="date"
            value={value.activeFrom}
            onChange={(e) => set("activeFrom", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Aktivno do (opciono)">
          <input
            type="date"
            value={value.activeUntil}
            onChange={(e) => set("activeUntil", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
    </SectionCard>
  );
}
