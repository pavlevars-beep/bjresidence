"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Status = "closed" | "open" | "submitting" | "success" | "error";

export function CompanyQuoteCta() {
  const [status, setStatus] = useState<Status>("closed");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("submitting");

    try {
      const res = await fetch("/api/company-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCount: Number(form.get("employeeCount")),
          arrivalDate: form.get("arrivalDate"),
          duration: form.get("duration"),
          email: form.get("email"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="my-6 flex items-start gap-3 rounded-3xl bg-olive-dark/10 p-6 text-olive-dark">
        <CheckCircle2 className="mt-0.5 shrink-0" size={22} />
        <p className="text-sm leading-relaxed">
          Thanks — your request is in. We&apos;ll get back to you with availability and pricing shortly.
        </p>
      </div>
    );
  }

  if (status === "open" || status === "submitting" || status === "error") {
    return (
      <div className="my-6 rounded-3xl bg-olive-dark/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-olive-dark">Request a company accommodation quote</p>
        <p className="mt-1 text-sm text-ink/60">Tell us a few details and we&apos;ll reply with availability and pricing.</p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Number of employees</span>
            <input type="number" name="employeeCount" min={1} required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Expected arrival date</span>
            <input type="date" name="arrivalDate" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Expected duration of stay</span>
            <input type="text" name="duration" placeholder="e.g. 6 months" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Contact email</span>
            <input type="email" name="email" required className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send request"}
            </Button>
            {status === "error" && <p className="mt-2 text-sm text-red-700">Something went wrong — please try again.</p>}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col items-start gap-4 rounded-3xl bg-olive-dark/10 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-olive-dark">BJ Residence for companies</p>
        <p className="mt-1 max-w-md text-base text-ink/75">
          Housing employees or contractors in Belgrade? Get a quote for the full residence or individual rooms.
        </p>
      </div>
      <Button type="button" onClick={() => setStatus("open")} className="shrink-0">
        Request company accommodation quote <ArrowRight size={16} />
      </Button>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-olive-dark focus:outline-none focus:ring-2 focus:ring-olive-dark/20";
