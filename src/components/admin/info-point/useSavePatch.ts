"use client";

import { useState } from "react";
import type { InfoPointConfig } from "@/lib/info-point";
import type { SaveStatus } from "./SaveBar";

/**
 * Shared "PUT a JSON patch, show save status" flow. Defaults to the Info
 * Point config endpoint (its original, only caller) — pass a different url
 * and generic type to reuse it for other admin editors (e.g. Residence
 * Management), including the PATCH/POST http methods some composite actions
 * need instead of PUT.
 */
export function useSavePatch<T = Partial<InfoPointConfig>>(
  url = "/api/admin/info-point",
  method: "PUT" | "PATCH" | "POST" = "PUT"
) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function save(patch: T) {
    setStatus("saving");
    try {
      const res = await fetch(url, {
        method,
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
