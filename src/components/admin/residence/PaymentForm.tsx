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
  initial,
  defaultType,
  defaultAmount,
  suggestedPeriod,
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
  /** Which period a new rent payment covers (see suggestRentPeriod) — prefilled so the usual case needs no typing. */
  suggestedPeriod?: { periodFrom: string; periodTo: string };
  onSaved: (payment: Payment) => void;
  onCancel: () => void;
}) {
  const prefill = initial ? null : suggestedPeriod;
  const [type, setType] = useState<PaymentType>(initial?.type ?? defaultType ?? "rent");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : defaultAmount ? String(defaultAmount) : "");
  const [paymentDate, setPaymentDate] = useState(initial?.paymentDate ?? todayISO());
  const [periodFrom, setPeriodFrom] = useState(initial?.periodFrom ?? prefill?.periodFrom ?? "");
  const [periodTo, setPeriodTo] = useState(initial?.periodTo ?? prefill?.periodTo ?? "");
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
        <Field label="Datum uplate"><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} /></Field>
        <Field label="Način plaćanja"><input value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass} /></Field>
        {type === "rent" && (
          <>
            <Field label="Period od">
              <input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Period do">
              <input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} className={inputClass} />
            </Field>
            {prefill && (
              <p className="text-xs text-ink/50 sm:col-span-2">
                Ako je tekući mesec već plaćen, kirija se automatski upisuje za sledeći mesec i pomera rok. Ako nije (npr. doplata), za tekući.
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
