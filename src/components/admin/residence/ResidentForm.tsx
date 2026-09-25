"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass, SectionCard, Toggle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { PassportOcrPanel, type ExtractedPassportFields } from "./PassportOcrPanel";
import type { CabinView } from "@/lib/residence/derive";

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

export function ResidentForm({ cabins }: { cabins: CabinView[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
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
    setPassportNumber((v) => v || fields.passportNumber);
    setPassportCountry((v) => v || fields.issuingCountry);
    setPassportIssueDate((v) => v || fields.passportIssueDate);
    setPassportExpiryDate((v) => v || fields.passportExpiryDate);
    setPassportScan({ fields, retain, file });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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

      router.push(`/admin/residence/residents/${data.resident.id}`);
    } catch {
      setStatus("error");
      setError("Greška — pokušajte ponovo.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PassportOcrPanel onConfirm={handleOcrConfirm} />

      <SectionCard title="Osnovni podaci">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ime"><input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} /></Field>
          <Field label="Prezime"><input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} /></Field>
          <Field label="Državljanstvo"><input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum rođenja"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} /></Field>
          <Field label="Telefon"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} /></Field>
          <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
          <Field label="Napomena" className="sm:col-span-2"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Identifikacija">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Broj pasoša"><input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className={inputClass} /></Field>
          <Field label="Zemlja izdavanja"><input value={passportCountry} onChange={(e) => setPassportCountry(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum izdavanja"><input type="date" value={passportIssueDate} onChange={(e) => setPassportIssueDate(e.target.value)} className={inputClass} /></Field>
          <Field label="Datum isteka"><input type="date" value={passportExpiryDate} onChange={(e) => setPassportExpiryDate(e.target.value)} className={inputClass} /></Field>
          <Field label="Drugi dokument (tip)"><input value={otherDocType} onChange={(e) => setOtherDocType(e.target.value)} className={inputClass} /></Field>
          <Field label="Broj dokumenta"><input value={otherDocNumber} onChange={(e) => setOtherDocNumber(e.target.value)} className={inputClass} /></Field>
        </div>
      </SectionCard>

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

      {assignCabin && (
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
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Čuvanje..." : "Sačuvaj gosta"}
        </Button>
        {status === "error" && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </form>
  );
}
