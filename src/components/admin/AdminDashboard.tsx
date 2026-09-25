"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { InfoBoardConfig } from "@/lib/info-board";
import { CleaningSection } from "./sections/CleaningSection";
import { AnnouncementSection } from "./sections/AnnouncementSection";
import { WeeklyItemsSection } from "./sections/WeeklyItemsSection";
import { ResidenceInfoSection } from "./sections/ResidenceInfoSection";
import { QrSection } from "./sections/QrSection";
import { TrafficSection } from "./sections/TrafficSection";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AdminDashboard({ initialConfig }: { initialConfig: InfoBoardConfig }) {
  const [config, setConfig] = useState<InfoBoardConfig>(initialConfig);
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/info-board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setConfig(data.config);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Info tabla</h1>
        <p className="mt-1 text-sm text-ink/55">Sadržaj kiosk ekrana na /infopult.</p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <CleaningSection value={config.cleaning} onChange={(v) => setConfig((c) => ({ ...c, cleaning: v }))} />
        <AnnouncementSection
          value={config.announcement}
          onChange={(v) => setConfig((c) => ({ ...c, announcement: v }))}
        />
        <WeeklyItemsSection
          value={config.weeklyItems}
          onChange={(v) => setConfig((c) => ({ ...c, weeklyItems: v }))}
        />
        <TrafficSection
          value={config.trafficDestinations}
          onChange={(v) => setConfig((c) => ({ ...c, trafficDestinations: v }))}
        />
        <ResidenceInfoSection
          value={config.residenceInfo}
          onChange={(v) => setConfig((c) => ({ ...c, residenceInfo: v }))}
        />
        <QrSection value={config.qr} onChange={(v) => setConfig((c) => ({ ...c, qr: v }))} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/8 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4 px-5 py-3.5 sm:px-8">
          {status === "saved" && <span className="text-sm font-medium text-olive-dark">Sačuvano.</span>}
          {status === "error" && <span className="text-sm font-medium text-red-700">Greška — pokušajte ponovo.</span>}
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Čuvanje..." : "Sačuvaj izmene"}
          </Button>
        </div>
      </div>
    </div>
  );
}
