"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import type { Payment, PaymentType } from "@/lib/residence/types";

const TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: "rent", label: "Kirija" },
  { value: "deposit", label: "Depozit" },
  { value: "deposit_return", label: "Povraćaj depozita" },
  { value: "other", label: "Ostalo" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentForm({
  residentId,
  cabinId,
  stayId,
  currency,
  onSaved,
  onCancel,
}: {
  residentId: string;
  cabinId: string;
  stayId: string;
  currency: string;
  onSaved: (payment: Payment) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<PaymentType>("rent");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit() {
    if (!amount) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/residence/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId,
          cabinId,
          stayId,
          type,
          amount: Number(amount),
          currency,
          paymentDate,
          periodFrom: type === "rent" ? periodFrom || null : null,
          periodTo: type === "rent" ? periodTo || null : null,
          method,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onSaved(data.payment);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Vrsta uplate">
          <select value={type} onChange={(e) => setType(e.target.value as PaymentType)} className={inputClass}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Iznos"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} /></Field>
        <Field label="Datum uplate"><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Način plaćanja"><input value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass} /></Field>
        {type === "rent" && (
          <>
            <Field label="Period od"><input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} className={inputClass} /></Field>
            <Field label="Period do"><input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} className={inputClass} /></Field>
          </>
        )}
        <Field label="Napomena" className="sm:col-span-2"><input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={status === "saving" || !amount}>
          {status === "saving" ? "Čuvanje..." : "Sačuvaj uplatu"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
