"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, Camera, Check, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { inputClass, Field, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

export interface ExtractedPassportFields {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  placeOfBirth: string;
  sex: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  issuingCountry: string;
  mrzRaw: string;
  needsReview: string[];
  reviewReasons: Record<string, string>;
  mrzValid: boolean;
}

const FIELD_LABELS: [keyof ExtractedPassportFields, string][] = [
  ["firstName", "Ime"],
  ["lastName", "Prezime"],
  ["nationality", "Državljanstvo"],
  ["dob", "Datum rođenja"],
  ["placeOfBirth", "Mesto rođenja"],
  ["sex", "Pol"],
  ["passportNumber", "Broj pasoša"],
  ["issuingCountry", "Zemlja izdavanja"],
  ["passportIssueDate", "Datum izdavanja"],
  ["passportExpiryDate", "Datum isteka"],
];

type Status = "idle" | "extracting" | "review" | "error";

export function PassportOcrPanel({
  onConfirm,
}: {
  onConfirm: (fields: ExtractedPassportFields, retain: boolean, file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<ExtractedPassportFields | null>(null);
  const [confirmedFields, setConfirmedFields] = useState<Set<string>>(new Set());
  const [retain, setRetain] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    if (/\.(heic|heif)$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif") {
      setStatus("error");
      setError("HEIC format nije podržan. Snimite fotografiju kao JPEG (na iPhone-u: Podešavanja → Kamera → Formati → Najkompatibilnije).");
      return;
    }

    setFile(f);
    setStatus("extracting");
    setError("");

    const formData = new FormData();
    formData.append("image", f);

    try {
      const res = await fetch("/api/admin/residence/passport-extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(
          data.error === "ocr_not_configured"
            ? "OCR nije podešen na serveru (nedostaje ANTHROPIC_API_KEY ili ANTHROPIC_PASSPORT_MODEL)."
            : "Nije uspelo očitavanje pasoša. Pokušajte ponovo ili unesite podatke ručno ispod."
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

  function updateField(key: keyof ExtractedPassportFields, value: string) {
    setFields((f) => (f ? { ...f, [key]: value } : f));
    // Editing a flagged field counts as the admin having looked at it.
    setConfirmedFields((prev) => new Set(prev).add(key));
  }

  function handleConfirm() {
    if (!fields) return;
    onConfirm(fields, retain, retain ? file : null);
    setStatus("idle");
    setFile(null);
    setFields(null);
    setRetain(false);
  }

  function handleRescan() {
    setStatus("idle");
    setFile(null);
    setFields(null);
    inputRef.current?.click();
  }

  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] p-4">
      <p className="text-sm font-semibold text-ink">Skeniraj pasoš (opciono)</p>
      <p className="mt-1 text-xs text-ink/50">
        Fotografišite ili otpremite pasoš — podaci se automatski očitavaju, ali ništa se ne čuva dok ne pregledate i potvrdite.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {status !== "review" && (
        <div className="mt-3">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={status === "extracting"}>
            {status === "extracting" ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Očitavanje...
              </>
            ) : (
              <>
                <Camera size={15} /> Fotografiši / otpremi pasoš
              </>
            )}
          </Button>
          {status === "error" && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      )}

      {status === "review" && fields && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-wood">Podaci pronađeni u pasošu — proverite i ispravite</p>
            <button
              type="button"
              onClick={handleRescan}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink/50 hover:bg-ink/5"
            >
              <RotateCcw size={12} /> Skeniraj ponovo
            </button>
          </div>

          {fields.mrzRaw && (
            <p className="text-xs text-ink/40">
              MRZ zona: {fields.mrzValid ? "kontrolne cifre se poklapaju" : "nije moglo da se potpuno potvrdi — proverite polja ispod pažljivije"}
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

          <Toggle checked={retain} onChange={setRetain} label="Zadrži originalni dokument (sigurno skladište)" />

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleConfirm}>
              <Check size={15} /> Potvrdi i primeni podatke
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStatus("idle");
                setFile(null);
                setFields(null);
              }}
            >
              Odustani
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
