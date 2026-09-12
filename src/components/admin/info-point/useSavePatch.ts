"use client";

import { useState } from "react";
import type { InfoPointConfig } from "@/lib/info-point";
import type { SaveStatus } from "./SaveBar";

/** Shared "save this slice of the Info Point config" flow used by every admin subpage. */
export function useSavePatch() {
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function save(patch: Partial<InfoPointConfig>) {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/info-point", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 2500);
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  return { status, save };
}
