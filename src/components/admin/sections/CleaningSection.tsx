import type { CleaningInfo } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

export function CleaningSection({
  value,
  onChange,
}: {
  value: CleaningInfo;
  onChange: (next: CleaningInfo) => void;
}) {
  const set = <K extends keyof CleaningInfo>(key: K, v: CleaningInfo[K]) => onChange({ ...value, [key]: v });

  return (
    <SectionCard
      title="Sledeće čišćenje"
      description="Prikazuje se na /info kad je uključeno i datum nije prošao."
      headerRight={<Toggle checked={value.enabled} onChange={(v) => set("enabled", v)} label="Uključeno" />}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Datum">
          <input type="date" value={value.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Početak">
          <input
            type="time"
            value={value.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Kraj">
          <input
            type="time"
            value={value.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Napomena (SR)" className="sm:col-span-3">
          <input
            type="text"
            value={value.noteSr}
            onChange={(e) => set("noteSr", e.target.value)}
            placeholder="Opciono"
            className={inputClass}
          />
        </Field>
        <Field label="Napomena (EN)" className="sm:col-span-3">
          <input
            type="text"
            value={value.noteEn}
            onChange={(e) => set("noteEn", e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </Field>
      </div>
    </SectionCard>
  );
}
