"use client";

import { useState } from "react";
import { Check, Download, FileSignature, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContractWizard } from "./ContractWizard";
import type { Contract, ContractStatus } from "@/lib/residence/types";

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft: "Nacrt",
  generated: "Generisan",
  signed: "Potpisan",
  cancelled: "Otkazan",
};

const STATUS_CLASS: Record<ContractStatus, string> = {
  draft: "bg-ink/10 text-ink/60",
  generated: "bg-wood/15 text-wood",
  signed: "bg-olive-dark/15 text-olive-dark",
  cancelled: "bg-red-100 text-red-700",
};

export function ContractsSection({
  residentId,
  stayId,
  contracts: initialContracts,
}: {
  residentId: string;
  stayId: string | null;
  contracts: Contract[];
}) {
  const [contracts, setContracts] = useState(initialContracts);
  const [showWizard, setShowWizard] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);

  const sorted = [...contracts].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  async function handleSignUpload(contractId: string, file: File) {
    setSigningId(contractId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/residence/contracts/${contractId}/sign`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.ok) {
        setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract : c)));
      }
    } finally {
      setSigningId(null);
    }
  }

  async function handleMarkSigned(contractId: string) {
    if (!confirm("Označiti ugovor kao potpisan bez otpremanja skenirane kopije?")) return;
    const res = await fetch(`/api/admin/residence/contracts/${contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "signed" }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract : c)));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="text-sm text-ink/50">Još nema generisanih ugovora.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">Ugovor od {c.generatedAt.slice(0, 10)}</p>
                  <p className="text-xs text-ink/50">Datum početka: {c.contractStartDate}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[c.status]}`}>
                  {STATUS_LABEL[c.status]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/admin/residence/contracts/${c.id}/file`}
                  className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  <Download size={13} /> DOCX
                </a>
                {c.signedBlobPathname && (
                  <a
                    href={`/api/admin/residence/contracts/${c.id}/file?type=signed`}
                    className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                  >
                    <Download size={13} /> Potpisana kopija
                  </a>
                )}
                {c.status !== "signed" && c.status !== "cancelled" && (
                  <>
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5">
                      <Upload size={13} /> {signingId === c.id ? "Otpremanje..." : "Otpremi potpisan"}
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        className="hidden"
                        disabled={signingId === c.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleSignUpload(c.id, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleMarkSigned(c.id)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-olive-dark hover:bg-olive-dark/10"
                    >
                      <Check size={13} /> Označi kao potpisan
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {stayId ? (
        showWizard ? (
          <ContractWizard
            residentId={residentId}
            stayId={stayId}
            onSkip={() => setShowWizard(false)}
            onGenerated={(contract) => {
              setContracts((prev) => [...prev, contract]);
              setShowWizard(false);
            }}
          />
        ) : (
          <Button type="button" variant="outline" onClick={() => setShowWizard(true)}>
            <FileSignature size={15} /> Generiši ugovor
          </Button>
        )
      ) : (
        <p className="text-xs text-ink/40">Potreban je unet boravak da bi se generisao ugovor.</p>
      )}
    </div>
  );
}
