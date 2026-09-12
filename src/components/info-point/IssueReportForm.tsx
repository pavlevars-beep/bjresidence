"use client";

import { useState, type FormEvent } from "react";
import { Camera, CheckCircle2, XCircle } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import { ISSUE_CATEGORIES, ISSUE_LOCATIONS, type IssueCategory, type IssueLocation } from "@/lib/info-point-issues";
import { cn } from "@/lib/utils";

type SubmitState = "idle" | "submitting" | "success" | "error";

const selectClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-olive-dark focus:outline-none focus:ring-2 focus:ring-olive-dark/20";

export function IssueReportForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { dict } = useInfoPointLanguage();
  const [category, setCategory] = useState<IssueCategory>("other");
  const [location, setLocation] = useState<IssueLocation>("room");
  const [description, setDescription] = useState("");
  const [residentName, setResidentName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setState("submitting");
    try {
      const formData = new FormData();
      formData.set("category", category);
      formData.set("location", location);
      formData.set("description", description.trim());
      if (residentName.trim()) formData.set("residentName", residentName.trim());
      if (photo) formData.set("photo", photo);

      const res = await fetch("/api/info-point/issues", { method: "POST", body: formData });
      if (!res.ok) throw new Error("failed");
      setState("success");
      onSubmitted?.();
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-olive-dark/20 bg-olive-dark/5 p-8 text-center">
        <CheckCircle2 size={40} className="text-olive-dark" />
        <p className="text-lg font-bold text-ink">{dict.issues.successTitle}</p>
        <p className="text-sm text-ink/60">{dict.issues.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-ink/60">{dict.issues.intro}</p>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{dict.issues.category}</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as IssueCategory)} className={selectClass}>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {dict.issues.categoryOptions[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{dict.issues.location}</span>
        <select value={location} onChange={(e) => setLocation(e.target.value as IssueLocation)} className={selectClass}>
          {ISSUE_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {dict.issues.locationOptions[l]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{dict.issues.description}</span>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={dict.issues.descriptionPlaceholder}
          className="w-full resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-olive-dark focus:outline-none focus:ring-2 focus:ring-olive-dark/20"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          {dict.issues.photo} <span className="normal-case text-ink/35">({dict.common.optional})</span>
        </span>
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ink/20 px-3.5 py-4 text-sm font-medium text-ink/60",
            photo && "border-olive-dark text-olive-dark"
          )}
        >
          <Camera size={17} />
          {photo ? photo.name : dict.issues.photoHint}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </label>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{dict.issues.residentName}</span>
        <input
          type="text"
          value={residentName}
          onChange={(e) => setResidentName(e.target.value)}
          placeholder={dict.issues.residentNamePlaceholder}
          className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-olive-dark focus:outline-none focus:ring-2 focus:ring-olive-dark/20"
        />
      </label>

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <XCircle size={16} className="shrink-0" /> {dict.issues.errorBody}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="mt-2 flex items-center justify-center rounded-full bg-olive-dark px-6 py-3.5 text-base font-semibold text-cream shadow-soft transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {state === "submitting" ? dict.issues.submitting : dict.issues.submit}
      </button>
    </form>
  );
}
