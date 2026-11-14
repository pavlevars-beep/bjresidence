"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { EARLY_RENEWAL_WINDOW_DAYS, suggestRentPeriod } from "@/lib/residence/date-math";
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
  initial,
  defaultType,
  defaultAmount,
  currentPeriod,
  onSaved,
  onCancel,
}: {
  residentId: string;
  cabinId: string;
  stayId: string;
  currency: string;
  initial?: Payment;
  defaultType?: PaymentType;
  /** Prefilled amount for a new payment — the stay's monthly rent, the usual case. */
  defaultAmount?: number;
  /** The stay's current paid-through period — used to prefill which period a new rent payment covers. */
  currentPeriod?: { start: string; end: string };
  onSaved: (payment: Payment) => void;
  onCancel: () => void;
}) {
  const suggestFor = (date: string) =>
    !initial && currentPeriod ? suggestRentPeriod(currentPeriod.start, currentPeriod.end, date) : null;
  const initialDate = initial?.paymentDate ?? todayISO();
  const initialSuggestion = suggestFor(initialDate);

  const [type, setType] = useState<PaymentType>(initial?.type ?? defaultType ?? "rent");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : defaultAmount ? String(defaultAmount) : "");
  const [paymentDate, setPaymentDate] = useState(initialDate);
  const [periodFrom, setPeriodFrom] = useState(initial?.periodFrom ?? initialSuggestion?.periodFrom ?? "");
  const [periodTo, setPeriodTo] = useState(initial?.periodTo ?? initialSuggestion?.periodTo ?? "");
  const [periodEdited, setPeriodEdited] = useState(false);

  function handlePaymentDateChange(date: string) {
    setPaymentDate(date);
    const suggestion = date && !periodEdited ? suggestFor(date) : null;
    if (suggestion) {
      setPeriodFrom(suggestion.periodFrom);
      setPeriodTo(suggestion.periodTo);
    }
  }
  const [method, setMethod] = useState(initial?.method ?? "Keš");
  const [note, setNote] = useState(initial?.note ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit() {
    if (!amount) return;
    setStatus("saving");
    try {
      const body = {
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
      };
      const res = await fetch(
        initial ? `/api/admin/residence/payments/${initial.id}` : "/api/admin/residence/payments",
        {
          method: initial ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      onSaved(initial ? data.payment : data.payment);
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
        <Field label="Datum uplate"><input type="date" value={paymentDate} onChange={(e) => handlePaymentDateChange(e.target.value)} className={inputClass} /></Field>
        <Field label="Način plaćanja"><input value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass} /></Field>
        {type === "rent" && (
          <>
            <Field label="Period od">
              <input type="date" value={periodFrom} onChange={(e) => { setPeriodEdited(true); setPeriodFrom(e.target.value); }} className={inputClass} />
            </Field>
            <Field label="Period do">
              <input type="date" value={periodTo} onChange={(e) => { setPeriodEdited(true); setPeriodTo(e.target.value); }} className={inputClass} />
            </Field>
            {currentPeriod && !initial && (
              <p className="text-xs text-ink/50 sm:col-span-2">
                Uplata u poslednjih {EARLY_RENEWAL_WINDOW_DAYS} dana perioda (ili kasnije) računa se za sledeći mesec i pomera rok. Ranija uplata se računa za tekući period (npr. doplata).
              </p>
            )}
          </>
        )}
        <Field label="Napomena" className="sm:col-span-2"><input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={status === "saving" || !amount}>
          {status === "saving" ? "Čuvanje..." : initial ? "Sačuvaj izmene" : "Sačuvaj uplatu"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Otkaži</Button>
        {status === "error" && <span className="text-sm text-red-700">Greška.</span>}
      </div>
    </div>
  );
}
