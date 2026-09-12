"use client";

import { useState } from "react";
import { Field, SectionCard, Toggle, inputClass } from "../ui";
import { SaveBar } from "./SaveBar";
import { useSavePatch } from "./useSavePatch";
import type { WifiConfig } from "@/lib/info-point";

export function WifiEditor({ initial }: { initial: WifiConfig }) {
  const [wifi, setWifi] = useState(initial);
  const { status, save } = useSavePatch();
  const set = <K extends keyof WifiConfig>(key: K, v: WifiConfig[K]) => setWifi((w) => ({ ...w, [key]: v }));

  return (
    <div className="flex flex-col gap-6 pb-20">
      <SectionCard
        title="Wi-Fi"
        description="Prikazuje se u sekciji Wi-Fi na Info Point stranici."
        headerRight={<Toggle checked={wifi.enabled} onChange={(v) => set("enabled", v)} label="Uključeno" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naziv mreže">
            <input value={wifi.networkName} onChange={(e) => set("networkName", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Lozinka">
            <input value={wifi.password} onChange={(e) => set("password", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6">
          <Field label="Prikaz lozinke">
            <select
              value={wifi.revealMode}
              onChange={(e) => set("revealMode", e.target.value as WifiConfig["revealMode"])}
              className={inputClass}
            >
              <option value="visible">Direktno vidljiva</option>
              <option value="tap">Otkriva se dodirom</option>
            </select>
          </Field>
          <Toggle checked={wifi.showQr} onChange={(v) => set("showQr", v)} label="Prikaži Wi-Fi QR kod" />
        </div>
      </SectionCard>

      <SaveBar status={status} onSave={() => save({ wifi })} />
    </div>
  );
}
