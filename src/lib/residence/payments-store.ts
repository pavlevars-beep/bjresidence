import { randomUUID } from "crypto";
import { readCollection, writeCollection } from "./collection-store";
import { advancePeriodFromPayment } from "./stays-store";
import type { Payment, PaymentType } from "./types";

const BLOB_PATH = "data/residence/payments.json";

export async function getPayments(): Promise<Payment[]> {
  return readCollection<Payment>(BLOB_PATH);
}

export async function getPaymentsForResident(residentId: string): Promise<Payment[]> {
  const items = await getPayments();
  return items.filter((p) => p.residentId === residentId);
}

export async function getPaymentsForStay(stayId: string): Promise<Payment[]> {
  const items = await getPayments();
  return items.filter((p) => p.stayId === stayId);
}

export type NewPaymentInput = {
  residentId: string;
  cabinId: string;
  stayId: string;
  type: PaymentType;
  amount: number;
  currency?: string;
  paymentDate: string;
  periodFrom?: string | null;
  periodTo?: string | null;
  method?: string;
  note?: string;
};

/**
 * Appends a payment to the ledger. Recording a rent payment with an explicit
 * period also advances the Stay's paid-through period (and resets the
 * continuation decision / reminder dedupe) — the one place that side effect
 * happens, so it can't be duplicated or forgotten elsewhere.
 */
export async function createPayment(input: NewPaymentInput): Promise<Payment> {
  const items = await getPayments();
  const payment: Payment = {
    id: randomUUID(),
    residentId: input.residentId,
    cabinId: input.cabinId,
    stayId: input.stayId,
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? "€",
    paymentDate: input.paymentDate,
    periodFrom: input.periodFrom ?? null,
    periodTo: input.periodTo ?? null,
    method: input.method ?? "",
    note: input.note ?? "",
    createdAt: new Date().toISOString(),
  };

  await writeCollection(BLOB_PATH, [...items, payment]);

  if (payment.type === "rent" && payment.periodFrom && payment.periodTo) {
    await advancePeriodFromPayment(payment.stayId, { periodFrom: payment.periodFrom, periodTo: payment.periodTo });
  }

  return payment;
}

export async function deletePayment(id: string): Promise<boolean> {
  const items = await getPayments();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  await writeCollection(BLOB_PATH, next);
  return true;
}

/** Deposit currently held for a resident = deposits paid - deposit returns. Keyed by resident, not stay, so it survives a cabin move. */
export async function getDepositHeld(residentId: string): Promise<number> {
  const items = await getPaymentsForResident(residentId);
  const held = items.filter((p) => p.type === "deposit").reduce((sum, p) => sum + p.amount, 0);
  const returned = items.filter((p) => p.type === "deposit_return").reduce((sum, p) => sum + p.amount, 0);
  return held - returned;
}
