import type { ResidenceInfo } from "@/lib/info-board";
import { Field, SectionCard, Toggle, inputClass } from "../ui";

export function ResidenceInfoSection({
  value,
  onChange,
}: {
  value: ResidenceInfo;
  onChange: (next: ResidenceInfo) => void;
}) {
  const set = <K extends keyof ResidenceInfo>(key: K, v: ResidenceInfo[K]) => onChange({ ...value, [key]: v });

  return (
    <SectionCard title="Korisne informacije" description="Traka na dnu /infopult table.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-44 sm:shrink-0">
            <Toggle checked={value.wifiEnabled} onChange={(v) => set("wifiEnabled", v)} label="Wi-Fi" />
          </div>
          <Field label="Naziv Wi-Fi mreže" className="flex-1">
            <input type="text" value={value.wifiName} onChange={(e) => set("wifiName", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-44 sm:shrink-0">
            <Toggle checked={value.quietHoursEnabled} onChange={(v) => set("quietHoursEnabled", v)} label="Mir u objektu" />
          </div>
          <Field label="Mir u objektu (tekst)" className="flex-1">
            <input
              type="text"
              value={value.quietHoursText}
              onChange={(e) => set("quietHoursText", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-44 sm:shrink-0">
            <Toggle checked={value.contactEnabled} onChange={(v) => set("contactEnabled", v)} label="Kontakt" />
          </div>
          <Field label="Telefon" className="flex-1">
            <input
              type="text"
              value={value.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}
