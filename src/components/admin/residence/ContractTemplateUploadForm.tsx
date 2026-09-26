"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Field, inputClass, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { ContractTemplate } from "@/lib/residence/types";

const CONTRACT_TYPES = [
  { value: "monthly_individual", label: "Mesečni individualni zakup" },
  { value: "company_rental", label: "Zakup za firmu" },
  { value: "short_term", label: "Kratkoročni smeštaj" },
  { value: "annex", label: "Aneks / produženje" },
];

export function ContractTemplateUploadForm({ onUploaded }: { onUploaded: (template: ContractTemplate, unknownPlaceholders: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0].value);
  const [language, setLanguage] = useState("sr");
  const [version, setVersion] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !name) return;

    setStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("contractType", contractType);
    formData.append("language", language);
    formData.append("version", version);
    formData.append("notes", notes);
    formData.append("active", String(active));

    try {
      const res = await fetch("/api/admin/residence/contract-templates", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error === "unsupported_type" ? "Fajl mora biti .docx" : "Greška pri otpremanju.");
        return;
      }
      onUploaded(data.template, data.unknownPlaceholders ?? []);
      setName("");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Greška u komunikaciji sa serverom.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Naziv šablona"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="npr. Ugovor o mesečnom zakupu" className={inputClass} /></Field>
        <Field label="Vrsta ugovora">
          <select value={contractType} onChange={(e) => setContractType(e.target.value)} className={inputClass}>
            {CONTRACT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Jezik">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="sr">Srpski</option>
            <option value="en">Engleski</option>
          </select>
        </Field>
        <Field label="Verzija"><input value={version} onChange={(e) => setVersion(e.target.value)} className={inputClass} /></Field>
        <Field label="Napomena" className="sm:col-span-2"><input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} /></Field>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink/50">DOCX fajl šablona</label>
        <input ref={fileRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className="mt-1.5 block w-full text-sm text-ink/70" />
      </div>

      <Toggle checked={active} onChange={setActive} label="Aktivan odmah nakon otpremanja" />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "uploading"}>
          <Upload size={15} /> {status === "uploading" ? "Otpremanje..." : "Otpremi šablon"}
        </Button>
        {status === "error" && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </form>
  );
}
