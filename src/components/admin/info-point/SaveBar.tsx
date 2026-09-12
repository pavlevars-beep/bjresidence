"use client";

import { Button } from "@/components/ui/Button";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SaveBar({ status, onSave }: { status: SaveStatus; onSave: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/8 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-end gap-4 px-5 py-3.5 sm:px-8">
        {status === "saved" && <span className="text-sm font-medium text-olive-dark">Sačuvano.</span>}
        {status === "error" && <span className="text-sm font-medium text-red-700">Greška — pokušajte ponovo.</span>}
        <Button onClick={onSave} disabled={status === "saving"}>
          {status === "saving" ? "Čuvanje..." : "Sačuvaj izmene"}
        </Button>
      </div>
    </div>
  );
}
