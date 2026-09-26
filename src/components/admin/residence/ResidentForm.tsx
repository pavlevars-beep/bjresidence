"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Field, inputClass, SectionCard, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { PassportOcrPanel, type ExtractedPassportFields } from "./PassportOcrPanel";
import { ContractWizard } from "./ContractWizard";
import type { CabinView } from "@/lib/residence/derive";
import type { Contract } from "@/lib/residence/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addMonthSuggestion(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);
  if (d.getDate() !== day) d.setDate(0); // clamp month overflow
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

type StepKey = "passport" | "details" | "stay" | "financial" | "contract" | "confirm";

const STEP_LABELS: Record<StepKey, string> = {
  passport: "Pasoš",
  details: "Podaci o gostu",
  stay: "Boravak",
  financial: "Finansije",
  contract: "Ugovor",
  confirm: "Potvrda",
};

export function ResidentForm({ cabins }: { cabins: CabinView[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [passportNumber, setPassportNumber] = useState("");
  const [passportCountry, setPassportCountry] = useState("");
  const [passportIssueDate, setPassportIssueDate] = useState("");
  const [passportExpiryDate, setPassportExpiryDate] = useState("");
  const [otherDocType, setOtherDocType] = useState("");
  const [otherDocNumber, setOtherDocNumber] = useState("");

  const [assignCabin, setAssignCabin] = useState(true);
  const [cabinId, setCabinId] = useState(cabins[0]?.cabin.id ?? "");
  const [moveInDate, setMoveInDate] = useState(todayISO());
  const [estimatedDurationLabel, setEstimatedDurationLabel] = useState("");
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(250);
  const [currency, setCurrency] = useState("€");

  const [initialRentAmount, setInitialRentAmount] = useState("");
  const [rentPaymentDate, setRentPaymentDate] = useState(todayISO());
  const [periodFrom, setPeriodFrom] = useState(moveInDate);
  const [periodTo, setPeriodTo] = useState(addMonthSuggestion(moveInDate));
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPaymentDate, setDepositPaymentDate] = useState(todayISO());

  const [passportScan, setPassportScan] = useState<{ fields: ExtractedPassportFields; retain: boolean; file: File | null } | null>(null);

  const [createdResidentId, setCreatedResidentId] = useState("");
  const [createdStayId, setCreatedStayId] = useState("");
  const [generatedContract, setGeneratedContract] = useState<Contract | null>(null);

  const stepKeys: StepKey[] = assignCabin
    ? ["passport", "details", "stay", "financial", "contract", "confirm"]
    : ["passport", "details", "stay", "confirm"];
  const currentKey = stepKeys[stepIndex] ?? stepKeys[stepKeys.length - 1];
  const isLastDataStep = assignCabin ? currentKey === "financial" : currentKey === "stay";
  const created = Boolean(createdResidentId);

  function handleMoveInChange(value: string) {
    setMoveInDate(value);
    setPeriodFrom(value);
    setPeriodTo(addMonthSuggestion(value));
  }

  function handleOcrConfirm(fields: ExtractedPassportFields, retain: boolean, file: File | null) {
    setFirstName((v) => v || fields.firstName);
    setLastName((v) => v || fields.lastName);
    setNationality((v) => v || fields.nationality);
    setDob((v) => v || fields.dob);
    setPlaceOfBirth((v) => v || fields.placeOfBirth);
    setSex((v) => v || fields.sex);
    setPassportNumber((v) => v || fields.passportNumber);
    setPassportCountry((v) => v || fields.issuingCountry);
    setPassportIssueDate((v) => v || fields.passportIssueDate);
    setPassportExpiryDate((v) => v || fields.passportExpiryDate);
    setPassportScan({ fields, retain, file });
  }

  async function handleCreateAndProceed() {
    setStatus("submitting");
    setError("");

    const payments = [];
    if (assignCabin && initialRentAmount) {
      payments.push({
        type: "rent",
        amount: Number(initialRentAmount),
        currency,
        paymentDate: rentPaymentDate,
        periodFrom,
        periodTo,
        method: "",
        note: "",
      });
    }
    if (assignCabin && depositAmount) {
      payments.push({
        type: "deposit",
        amount: Number(depositAmount),
        currency,
        paymentDate: depositPaymentDate,
        method: "",
        note: "",
      });
    }

    try {
      const res = await fetch("/api/admin/residence/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resident: {
            firstName,
            lastName,
            nationality,
            dob,
            placeOfBirth,
            sex,
            phone,
            email,
            notes,
            status: assignCabin ? "active" : "planned",
            passportNumber,
            passportCountry,
            passportIssueDate,
            passportExpiryDate,
            otherDocType,
            otherDocNumber,
          },
          stay: assignCabin
            ? { cabinId, moveInDate, estimatedDurationLabel, expectedMoveOutDate: expectedMoveOutDate || null, monthlyRent, currency }
            : null,
          payments,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");

      if (passportScan) {
        const formData = new FormData();
        formData.append("residentId", data.resident.id);
        formData.append("type", "passport");
        formData.append("retain", String(passportScan.retain));
        formData.append("extractedFieldsSnapshot", JSON.stringify(passportScan.fields));
        if (passportScan.retain && passportScan.file) formData.append("image", passportScan.file);
        await fetch("/api/admin/residence/documents", { method: "POST", body: formData }).catch(() => {});
      }

      setCreatedResidentId(data.resident.id);
      setCreatedStayId(data.stay?.id ?? "");
      setStatus("idle");
      setStepIndex((i) => Math.min(i + 1, stepKeys.length - 1));
    } catch {
      setStatus("error");
      setError("Greška — pokušajte ponovo.");
    }
  }

  function goNext() {
    if (currentKey === "details") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Unesite ime i prezime.");
        return;
      }
    }
    if (currentKey === "stay" && assignCabin) {
      if (!cabinId || !moveInDate) {
        setError("Izaberite kabinu i datum useljenja.");
        return;
      }
    }
    setError("");
    if (isLastDataStep) {
      void handleCreateAndProceed();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, stepKeys.length - 1));
  }

  function goBack() {
    setError("");
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function finish() {
    router.push(`/admin/residence/residents/${createdResidentId}`);
  }

  const cabinName = cabins.find((v) => v.cabin.id === cabinId)?.cabin.name ?? "";

  let stepContent: ReactNode = null;
  if (currentKey === "passport") {
    stepContent = (
      <SectionCard title="Skeniranje pasoša" description="Opciono — možete uneti podatke i ručno u sledećem koraku.">
        <PassportOcrPanel onConfirm={handleOcrConfirm} />
      </SectionCard>
    );
  } else if (currentKey === "details") {
    stepContent = (
      <SectionCard title="Osnovni podaci">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ime"><input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} /></Field>
          <Field label="Prezime"><input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} /></Field>
          <Field label="Državljanstvo"><input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum rođenja"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} /></Field>
          <Field label="Mesto rođenja"><input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className={inputClass} /></Field>
          <Field label="Pol"><input value={sex} onChange={(e) => setSex(e.target.value)} placeholder="M / Ž" className={inputClass} /></Field>
          <Field label="Telefon"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} /></Field>
          <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
          <Field label="Napomena" className="sm:col-span-2"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} /></Field>
        </div>
        <div className="mt-6 border-t border-ink/10 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-wood">Identifikacija</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Broj pasoša"><input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className={inputClass} /></Field>
            <Field label="Zemlja izdavanja"><input value={passportCountry} onChange={(e) => setPassportCountry(e.target.value)} className={inputClass} /></Field>
            <Field label="Datum izdavanja"><input type="date" value={passportIssueDate} onChange={(e) => setPassportIssueDate(e.target.value)} className={inputClass} /></Field>
            <Field label="Datum isteka"><input type="date" value={passportExpiryDate} onChange={(e) => setPassportExpiryDate(e.target.value)} className={inputClass} /></Field>
            <Field label="Drugi dokument (tip)"><input value={otherDocType} onChange={(e) => setOtherDocType(e.target.value)} className={inputClass} /></Field>
            <Field label="Broj dokumenta"><input value={otherDocNumber} onChange={(e) => setOtherDocNumber(e.target.value)} className={inputClass} /></Field>
          </div>
        </div>
      </SectionCard>
    );
  } else if (currentKey === "stay") {
    stepContent = (
      <SectionCard title="Boravak" headerRight={<Toggle checked={assignCabin} onChange={setAssignCabin} label="Dodeli kabinu sada" />}>
        {assignCabin ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kabina">
              <select value={cabinId} onChange={(e) => setCabinId(e.target.value)} className={inputClass}>
                {cabins.map((v) => (
                  <option key={v.cabin.id} value={v.cabin.id}>
                    {v.cabin.name} — {v.liveStatus === "available" ? "slobodno" : v.liveStatus === "occupied" ? "zauzeto" : v.liveStatus === "reserved" ? "rezervisano" : "održavanje"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Datum useljenja">
              <input type="date" required value={moveInDate} onChange={(e) => handleMoveInChange(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Procenjeno trajanje"><input value={estimatedDurationLabel} onChange={(e) => setEstimatedDurationLabel(e.target.value)} placeholder="npr. 3 meseca" className={inputClass} /></Field>
            <Field label="Očekivani datum iseljenja">
              <input type="date" value={expectedMoveOutDate} onChange={(e) => setExpectedMoveOutDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Mesečna kirija">
              <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Valuta">
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} />
            </Field>
          </div>
        ) : (
          <p className="text-sm text-ink/50">Gost će biti sačuvan sa statusom &quot;Planiran&quot;, bez dodele kabine.</p>
        )}
      </SectionCard>
    );
  } else if (currentKey === "financial") {
    stepContent = (
      <SectionCard title="Finansije" description="Opciono — prve uplate možete uneti i kasnije sa profila gosta.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Iznos kirije (prva uplata)"><input type="number" value={initialRentAmount} onChange={(e) => setInitialRentAmount(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum uplate kirije"><input type="date" value={rentPaymentDate} onChange={(e) => setRentPaymentDate(e.target.value)} className={inputClass} /></Field>
          <Field label="Period od"><input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} className={inputClass} /></Field>
          <Field label="Period do"><input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} className={inputClass} /></Field>
          <Field label="Iznos depozita"><input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum uplate depozita"><input type="date" value={depositPaymentDate} onChange={(e) => setDepositPaymentDate(e.target.value)} className={inputClass} /></Field>
        </div>
      </SectionCard>
    );
  } else if (currentKey === "contract") {
    stepContent = (
      <SectionCard title="Ugovor" description="Generišite ugovor odmah ili preskočite — možete ga generisati kasnije sa profila gosta.">
        {created ? (
          <ContractWizard
            residentId={createdResidentId}
            stayId={createdStayId}
            onSkip={() => setStepIndex(stepKeys.indexOf("confirm"))}
            onGenerated={(contract) => {
              setGeneratedContract(contract);
              setStepIndex(stepKeys.indexOf("confirm"));
            }}
          />
        ) : (
          <p className="text-sm text-ink/50">Čuvanje podataka gosta...</p>
        )}
      </SectionCard>
    );
  } else if (currentKey === "confirm") {
    stepContent = (
      <SectionCard title="Potvrda">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-olive-dark">
            <Check size={16} /> Gost je sačuvan.
          </div>
          <dl className="grid gap-x-4 gap-y-2 rounded-2xl border border-ink/10 bg-white p-4 sm:grid-cols-2">
            <div className="flex justify-between gap-2 text-sm"><dt className="text-ink/50">Gost</dt><dd className="font-medium text-ink">{firstName} {lastName}</dd></div>
            {assignCabin && (
              <>
                <div className="flex justify-between gap-2 text-sm"><dt className="text-ink/50">Kabina</dt><dd className="font-medium text-ink">{cabinName}</dd></div>
                <div className="flex justify-between gap-2 text-sm"><dt className="text-ink/50">Datum useljenja</dt><dd className="font-medium text-ink">{moveInDate}</dd></div>
                <div className="flex justify-between gap-2 text-sm"><dt className="text-ink/50">Mesečna kirija</dt><dd className="font-medium text-ink">{monthlyRent} {currency}</dd></div>
              </>
            )}
          </dl>
          {generatedContract && (
            <p className="text-sm text-olive-dark">Ugovor je generisan i dostupan je na profilu gosta.</p>
          )}
          <Button type="button" onClick={finish}>
            Idi na profil gosta <ArrowRight size={15} />
          </Button>
        </div>
      </SectionCard>
    );
  }

  const showBack = stepIndex > 0 && currentKey !== "contract" && currentKey !== "confirm";
  const showNext = currentKey !== "contract" && currentKey !== "confirm";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-wood">
        Korak {stepIndex + 1} od {stepKeys.length} · {STEP_LABELS[currentKey]}
      </p>

      {stepContent}

      {error && <p className="text-sm text-red-700">{error}</p>}

      {(showBack || showNext) && (
        <div className="flex items-center gap-3">
          {showBack && (
            <Button type="button" variant="outline" onClick={goBack}>
              <ArrowLeft size={15} /> Nazad
            </Button>
          )}
          {showNext && (
            <Button type="button" onClick={goNext} disabled={status === "submitting"}>
              {status === "submitting" ? "Čuvanje..." : isLastDataStep ? "Sačuvaj i nastavi" : "Dalje"}
              {status !== "submitting" && <ArrowRight size={15} />}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
