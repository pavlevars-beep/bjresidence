"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { inputClass } from "./ui";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige/40 px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-ink/8 bg-white/80 p-8 shadow-card">
        <div className="flex items-center gap-2.5">
          <Image src="/images/brand/icon-mark.png" alt="" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight text-ink">BJ Residence</span>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-wood">Admin</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Lozinka</span>
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>

          <Button type="submit" disabled={status === "submitting"} className="w-full">
            {status === "submitting" ? "Prijavljivanje..." : "Prijavi se"}
          </Button>

          {status === "error" && (
            <p className="text-sm text-red-700">Pogrešna lozinka ili admin nije podešen (ADMIN_PASSWORD).</p>
          )}
        </form>
      </div>
    </div>
  );
}
