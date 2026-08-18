"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
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
  const router = useRouter();
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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-beige/30 pb-24">
      <header className="sticky top-0 z-20 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/images/brand/icon-mark.png" alt="" width={32} height={32} className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold leading-tight text-ink">BJ Residence</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wood">Info Board Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/infopult"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
            >
              <ExternalLink size={15} /> Otvori /infopult
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
            >
              <LogOut size={15} /> Odjava
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8">
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
