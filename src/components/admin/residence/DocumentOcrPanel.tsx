"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, Camera, Check, CheckCircle2, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { inputClass, Field, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

export interface ExtractedFieldPair {
  label: string;
  value: string;
}

export interface ExtractedDocumentFields {
  documentType: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  personalIdNumber: string;
  nationality: string;
  dob: string;
  placeOfBirth: string;
  sex: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  issuingAuthority: string;
  additionalFields: ExtractedFieldPair[];
  mrzRaw: string;
  mrzFormat: "TD3" | "TD1" | "";
  needsReview: string[];
  reviewReasons: Record<string, string>;
  mrzValid: boolean;
}

const DOCUMENT_TYPES: [string, string][] = [
  ["passport", "Pasoš"],
  ["national_id", "Lična karta"],
  ["residence_permit", "Boravišna dozvola"],
  ["other", "Drugi dokument"],
];

const FIELD_LABELS: [keyof ExtractedDocumentFields, string][] = [
  ["firstName", "Ime"],
  ["lastName", "Prezime"],
  ["nationality", "Državljanstvo"],
  ["dob", "Datum rođenja"],
  ["placeOfBirth", "Mesto rođenja"],
  ["sex", "Pol"],
  ["documentNumber", "Broj dokumenta"],
  ["personalIdNumber", "JMBG / matični broj"],
  ["issuingCountry", "Zemlja izdavanja"],
  ["issuingAuthority", "Organ izdavanja"],
  ["issueDate", "Datum izdavanja"],
  ["expiryDate", "Datum isteka"],
];

type Status = "idle" | "extracting" | "review" | "error";
const MAX_IMAGES = 4;

export function DocumentOcrPanel({
  onConfirm,
}: {
  onConfirm: (documentType: string, fields: ExtractedDocumentFields, retain: boolean, files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [fields, setFields] = useState<ExtractedDocumentFields | null>(null);
  const [confirmedFields, setConfirmedFields] = useState<Set<string>>(new Set());
  const [retain, setRetain] = useState(false);

  function addFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const heic = picked.find((f) => /\.(heic|heif)$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif");
    if (heic) {
      setStatus("error");
      setError("HEIC format nije podržan. Snimite fotografiju kao JPEG (na iPhone-u: Podešavanja → Kamera → Formati → Najkompatibilnije).");
      return;
    }

    setError("");
    setStatus("idle");
    setStagedFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  }

  function removeStaged(index: number) {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleExtract() {
    if (stagedFiles.length === 0) return;
    setStatus("extracting");
    setError("");

    const formData = new FormData();
    for (const f of stagedFiles) formData.append("images", f);

    try {
      const res = await fetch("/api/admin/residence/document-extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(
          data.error === "ocr_not_configured"
            ? "OCR nije podešen na serveru (nedostaje ANTHROPIC_API_KEY ili ANTHROPIC_PASSPORT_MODEL)."
            : "Nije uspelo očitavanje dokumenta. Pokušajte ponovo ili unesite podatke ručno ispod."
        );
        return;
      }
      setFields(data.fields);
      setConfirmedFields(new Set());
      setStatus("review");
    } catch {
      setStatus("error");
      setError("Greška u komunikaciji sa serverom.");
    }
  }

  function updateField(key: keyof ExtractedDocumentFields, value: string) {
    setFields((f) => (f ? { ...f, [key]: value } : f));
    // Editing a flagged field counts as the admin having looked at it.
    setConfirmedFields((prev) => new Set(prev).add(key));
  }

  function updateExtraField(index: number, value: string) {
    setFields((f) => {
      if (!f) return f;
      const additionalFields = f.additionalFields.map((p, i) => (i === index ? { ...p, value } : p));
      return { ...f, additionalFields };
    });
  }

  function removeExtraField(index: number) {
    setFields((f) => (f ? { ...f, additionalFields: f.additionalFields.filter((_, i) => i !== index) } : f));
  }

  function reset() {
    setStatus("idle");
    setStagedFiles([]);
    setFields(null);
    setRetain(false);
  }

  function handleConfirm() {
    if (!fields) return;
    onConfirm(fields.documentType, fields, retain, retain ? stagedFiles : []);
    reset();
  }

  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] p-4">
      <p className="text-sm font-semibold text-ink">Skeniraj dokument (opciono)</p>
      <p className="mt-1 text-xs text-ink/50">
        Pasoš, lična karta, boravišna dozvola — šta god imate. Dodajte i prednju i zadnju stranu ako dokument ima
        podatke sa obe strane; podaci se automatski očitavaju, ali ništa se ne čuva dok ne pregledate i potvrdite.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={addFiles}
        className="hidden"
      />

      {status !== "review" && (
        <div className="mt-3 flex flex-col gap-3">
          {stagedFiles.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {stagedFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 rounded-full bg-ink/5 py-1 pl-3 pr-1.5 text-xs text-ink/70">
                  {f.name.length > 20 ? `${f.name.slice(0, 17)}…` : f.name}
                  <button type="button" onClick={() => removeStaged(i)} className="rounded-full p-0.5 hover:bg-ink/10">
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={status === "extracting" || stagedFiles.length >= MAX_IMAGES}
            >
              {stagedFiles.length === 0 ? (
                <>
                  <Camera size={15} /> Fotografiši / otpremi dokument
                </>
              ) : (
                <>
                  <Plus size={15} /> Dodaj još jednu stranu
                </>
              )}
            </Button>

            {stagedFiles.length > 0 && (
              <Button type="button" onClick={handleExtract} disabled={status === "extracting"}>
                {status === "extracting" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Očitavanje...
                  </>
                ) : (
                  <>Očitaj {stagedFiles.length > 1 ? `(${stagedFiles.length} slike)` : ""}</>
                )}
              </Button>
            )}
          </div>
          {status === "error" && <p className="text-sm text-red-700">{error}</p>}
        </div>
      )}

      {status === "review" && fields && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-wood">Podaci pronađeni u dokumentu — proverite i ispravite</p>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink/50 hover:bg-ink/5"
            >
              <RotateCcw size={12} /> Skeniraj ponovo
            </button>
          </div>

          <Field label="Tip dokumenta">
            <select
              value={fields.documentType}
              onChange={(e) => setFields((f) => (f ? { ...f, documentType: e.target.value } : f))}
              className={inputClass}
            >
              {DOCUMENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {fields.mrzRaw && (
            <p className="text-xs text-ink/40">
              MRZ zona ({fields.mrzFormat || "?"}): {fields.mrzValid ? "kontrolne cifre se poklapaju" : "nije moglo da se potpuno potvrdi — proverite polja ispod pažljivije"}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {FIELD_LABELS.map(([key, label]) => {
              const flagged = fields.needsReview.includes(key) && !confirmedFields.has(key);
              const reason = fields.reviewReasons[key];
              return (
                <Field key={key} label={label}>
                  <input
                    type="text"
                    value={fields[key] as string}
                    onChange={(e) => updateField(key, e.target.value)}
                    className={`${inputClass} ${flagged ? "border-wood focus:border-wood" : ""}`}
                    placeholder={fields[key] ? undefined : "nije prepoznato"}
                  />
                  <span className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${flagged ? "text-wood" : "text-olive-dark"}`}>
                    {flagged ? (
                      <>
                        <AlertTriangle size={11} /> Za proveru{reason ? ` — ${reason}` : ""}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={11} /> Potvrđeno
                      </>
                    )}
                  </span>
                </Field>
              );
            })}
          </div>

          {fields.additionalFields.length > 0 && (
            <div className="border-t border-ink/10 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wood">
                Ostalo pronađeno na dokumentu
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.additionalFields.map((pair, i) => (
                  <Field key={i} label={pair.label}>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={pair.value}
                        onChange={(e) => updateExtraField(i, e.target.value)}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraField(i)}
                        className="shrink-0 rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink"
                        title="Ukloni"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </Field>
                ))}
              </div>
            </div>
          )}

          <Toggle checked={retain} onChange={setRetain} label="Zadrži originalne slike (sigurno skladište)" />

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleConfirm}>
              <Check size={15} /> Potvrdi i primeni podatke
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              Odustani
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
