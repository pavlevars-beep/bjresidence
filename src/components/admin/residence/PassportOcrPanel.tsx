"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { inputClass, Field, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

export interface ExtractedPassportFields {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  sex: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  issuingCountry: string;
  mrzRaw: string;
}

const FIELD_LABELS: [keyof ExtractedPassportFields, string][] = [
  ["firstName", "Ime"],
  ["lastName", "Prezime"],
  ["passportNumber", "Broj pasoša"],
  ["nationality", "Državljanstvo"],
  ["dob", "Datum rođenja"],
  ["sex", "Pol"],
  ["passportIssueDate", "Datum izdavanja"],
  ["passportExpiryDate", "Datum isteka"],
  ["issuingCountry", "Zemlja izdavanja"],
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
      setStatus("review");
    } catch {
      setStatus("error");
      setError("Greška u komunikaciji sa serverom.");
    }
  }

  function updateField(key: keyof ExtractedPassportFields, value: string) {
    setFields((f) => (f ? { ...f, [key]: value } : f));
  }

  function handleConfirm() {
    if (!fields) return;
    onConfirm(fields, retain, retain ? file : null);
    setStatus("idle");
    setFile(null);
    setFields(null);
    setRetain(false);
  }

  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] p-4">
      <p className="text-sm font-semibold text-ink">Skeniraj pasoš (opciono)</p>
      <p className="mt-1 text-xs text-ink/50">
        Fotografišite ili otpremite pasoš — podaci se automatski očitavaju, ali ništa se ne čuva dok ne pregledate i potvrdite.
      </p>

      {status !== "review" && (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
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
          <p className="text-xs font-semibold uppercase tracking-wide text-wood">Podaci pronađeni u pasošu — proverite i ispravite</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELD_LABELS.map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  type="text"
                  value={fields[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className={inputClass}
                  placeholder={fields[key] ? undefined : "nije prepoznato"}
                />
              </Field>
            ))}
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
