"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Resident } from "@/lib/residence/types";

export function ResidentEditForm({
  resident,
  onSaved,
  onCancel,
}: {
  resident: Resident;
  onSaved: (resident: Resident) => void;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(resident.firstName);
  const [lastName, setLastName] = useState(resident.lastName);
  const [nationality, setNationality] = useState(resident.nationality);
  const [dob, setDob] = useState(resident.dob);
  const [placeOfBirth, setPlaceOfBirth] = useState(resident.placeOfBirth);
  const [sex, setSex] = useState(resident.sex);
  const [phone, setPhone] = useState(resident.phone);
  const [email, setEmail] = useState(resident.email);
  const [passportNumber, setPassportNumber] = useState(resident.passportNumber);
  const [passportCountry, setPassportCountry] = useState(resident.passportCountry);
  const [passportIssueDate, setPassportIssueDate] = useState(resident.passportIssueDate);
  const [passportExpiryDate, setPassportExpiryDate] = useState(resident.passportExpiryDate);
  const [otherDocType, setOtherDocType] = useState(resident.otherDocType);
  const [otherDocNumber, setOtherDocNumber] = useState(resident.otherDocNumber);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/residence/residents/${resident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          nationality,
          dob,
          placeOfBirth,
          sex,
          phone,
          email,
          passportNumber,
          passportCountry,
          passportIssueDate,
          passportExpiryDate,
          otherDocType,
          otherDocNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onSaved(data.resident);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ime"><input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} /></Field>
        <Field label="Prezime"><input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} /></Field>
        <Field label="Državljanstvo"><input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputClass} /></Field>
        <Field label="Datum rođenja"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} /></Field>
        <Field label="Mesto rođenja"><input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className={inputClass} /></Field>
        <Field label="Pol"><input value={sex} onChange={(e) => setSex(e.target.value)} placeholder="M / Ž" className={inputClass} /></Field>
        <Field label="Telefon"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} /></Field>
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
      </div>
      <div className="border-t border-ink/10 pt-4">
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
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? "Čuvanje..." : "Sačuvaj izmene"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
