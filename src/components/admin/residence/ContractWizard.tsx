"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Download, Eye, SkipForward } from "lucide-react";
import { inputClass, Field } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Contract, ContractTemplate } from "@/lib/residence/types";
import type { ContractVariableDef } from "@/lib/residence/contract-variables";

const VARIABLE_LABELS: Record<string, string> = {
  contract_date: "Datum ugovora",
  resident_full_name: "Gost",
  nationality: "Državljanstvo",
  date_of_birth: "Datum rođenja",
  place_of_birth: "Mesto rođenja",
  passport_number: "Broj pasoša",
  passport_expiry: "Datum isteka pasoša",
  cabin_name: "Kabina",
  move_in_date: "Datum useljenja",
  expected_move_out_date: "Očekivano iseljenje",
  expected_stay_label: "Očekivano trajanje",
  monthly_rent: "Mesečna kirija",
  deposit_amount: "Depozit",
  currency: "Valuta",
};

const SUMMARY_KEYS = Object.keys(VARIABLE_LABELS);

type Status = "idle" | "loading_templates" | "previewing" | "generating" | "done" | "error";

export function ContractWizard({
  residentId,
  stayId,
  onSkip,
  onGenerated,
}: {
  residentId: string;
  stayId: string;
  onSkip?: () => void;
  onGenerated?: (contract: Contract) => void;
}) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [status, setStatus] = useState<Status>("loading_templates");
  const [error, setError] = useState("");
  const [variables, setVariables] = useState<Record<string, string> | null>(null);
  const [missing, setMissing] = useState<ContractVariableDef[]>([]);
  const [overrideMissing, setOverrideMissing] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    fetch("/api/admin/residence/contract-templates")
      .then((res) => res.json())
      .then((data) => {
        const active: ContractTemplate[] = (data.templates ?? []).filter((t: ContractTemplate) => t.active);
        setTemplates(active);
        setTemplateId(active[0]?.id ?? "");
        setStatus("idle");
      })
      .catch(() => setStatus("idle"));
  }, []);

  async function handlePreview() {
    if (!templateId) return;
    setStatus("previewing");
    setError("");
    try {
      const res = await fetch("/api/admin/residence/contracts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residentId, stayId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      setVariables(data.variables);
      setMissing(data.missing);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Greška pri učitavanju pregleda.");
    }
  }

  async function handleGenerate() {
    if (!templateId) return;
    setStatus("generating");
    setError("");
    try {
      const res = await fetch("/api/admin/residence/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residentId, stayId, templateId, overrideMissing }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "missing_required") {
          setMissing(data.missing ?? []);
          setStatus("error");
          setError("Nedostaju obavezna polja — proverite listu ispod ili označite da ipak generišete ugovor.");
          return;
        }
        throw new Error("failed");
      }
      setContract(data.contract);
      setStatus("done");
      onGenerated?.(data.contract);
    } catch {
      setStatus("error");
      setError("Greška pri generisanju ugovora.");
    }
  }

  if (status === "loading_templates") {
    return <p className="text-sm text-ink/50">Učitavanje šablona...</p>;
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] p-4 text-sm text-ink/60">
        Nema aktivnih šablona ugovora. Otpremite jedan u <span className="font-medium">Upravljanje smeštajem → Šabloni ugovora</span>.
      </div>
    );
  }

  if (status === "done" && contract) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-olive-dark/20 bg-olive-dark/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-olive-dark">
          <Check size={16} /> Ugovor je generisan.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/admin/residence/contracts/${contract.id}/file`}
            className="flex items-center gap-1.5 rounded-full bg-olive-dark px-4 py-2 text-sm font-medium text-cream hover:bg-[#4a5241]"
          >
            <Download size={15} /> Preuzmi DOCX
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Šablon ugovora">
        <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); setVariables(null); }} className={inputClass}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} (v{t.version}, {t.language.toUpperCase()})</option>
          ))}
        </select>
      </Field>

      {variables && (
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-wood">Pregled podataka za ugovor</p>
          <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {SUMMARY_KEYS.map((key) => (
              <div key={key} className="flex justify-between gap-2 text-sm">
                <dt className="text-ink/50">{VARIABLE_LABELS[key]}</dt>
                <dd className="font-medium text-ink">{variables[key] || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {missing.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertTriangle size={16} /> Nedostaju obavezna polja:
          </p>
          <ul className="list-disc pl-6 text-sm text-red-700">
            {missing.map((m) => (
              <li key={m.key}>{m.label}</li>
            ))}
          </ul>
          <label className="mt-1 flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={overrideMissing} onChange={(e) => setOverrideMissing(e.target.checked)} />
            Generiši ipak, uprkos nedostajućim poljima
          </label>
        </div>
      )}

      {status === "error" && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={handlePreview} disabled={status === "previewing"}>
          <Eye size={15} /> {status === "previewing" ? "Učitavanje..." : "Prikaži pregled"}
        </Button>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={status === "generating" || (missing.length > 0 && !overrideMissing && variables !== null)}
        >
          <Check size={15} /> {status === "generating" ? "Generisanje..." : "Generiši ugovor"}
        </Button>
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            <SkipForward size={15} /> Preskoči za sada
          </Button>
        )}
      </div>
    </div>
  );
}
