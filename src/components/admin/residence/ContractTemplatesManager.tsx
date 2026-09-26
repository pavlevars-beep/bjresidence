"use client";

import { useState } from "react";
import { AlertTriangle, Check, Download, X } from "lucide-react";
import { ContractTemplateUploadForm } from "./ContractTemplateUploadForm";
import type { ContractTemplate } from "@/lib/residence/types";

export function ContractTemplatesManager({ initial }: { initial: ContractTemplate[] }) {
  const [templates, setTemplates] = useState(initial);
  const [uploadWarning, setUploadWarning] = useState<{ templateName: string; unknown: string[] } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActive(template: ContractTemplate) {
    setBusyId(template.id);
    try {
      const res = await fetch(`/api/admin/residence/contract-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !template.active }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTemplates((prev) => prev.map((t) => (t.id === template.id ? data.template : t)));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ContractTemplateUploadForm
        onUploaded={(template, unknown) => {
          setTemplates((prev) => [template, ...prev]);
          if (unknown.length > 0) setUploadWarning({ templateName: template.name, unknown });
        }}
      />

      {uploadWarning && (
        <div className="flex items-start gap-2 rounded-2xl border border-wood/30 bg-wood/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-wood" />
          <div className="text-sm text-ink/80">
            <p className="font-medium">
              Šablon &quot;{uploadWarning.templateName}&quot; sadrži nepoznata polja koja sistem ne popunjava automatski:
            </p>
            <p className="mt-1 font-mono text-xs text-wood">
              {uploadWarning.unknown.map((u) => `{{${u}}}`).join(", ")}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              Ova polja će ostati prazna u generisanom ugovoru osim ako izmenite šablon da koristi prepoznata polja (vidi tabelu ispod).
            </p>
          </div>
          <button onClick={() => setUploadWarning(null)} className="ml-auto shrink-0 rounded-full p-1 text-ink/40 hover:bg-ink/5">
            <X size={14} />
          </button>
        </div>
      )}

      {templates.length === 0 ? (
        <p className="text-sm text-ink/50">Nema otpremljenih šablona.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {templates.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
              <div>
                <p className="text-sm font-medium text-ink">{t.name} <span className="text-xs font-normal text-ink/40">v{t.version} · {t.language.toUpperCase()}</span></p>
                <p className="text-xs text-ink/50">{t.detectedPlaceholders.length} polja · otpremljeno {new Date(t.uploadedAt).toLocaleDateString("sr-RS")}{t.notes ? ` · ${t.notes}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/admin/residence/contract-templates/${t.id}/file`}
                  className="flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-ink/10"
                >
                  <Download size={13} /> Preuzmi
                </a>
                <button
                  onClick={() => toggleActive(t)}
                  disabled={busyId === t.id}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    t.active ? "bg-olive-dark/10 text-olive-dark hover:bg-olive-dark/20" : "bg-ink/5 text-ink/50 hover:bg-ink/10"
                  }`}
                >
                  {t.active ? (
                    <>
                      <Check size={13} /> Aktivan
                    </>
                  ) : (
                    "Neaktivan"
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
