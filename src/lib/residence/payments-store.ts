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

export type PaymentPatch = Partial<
  Pick<Payment, "type" | "amount" | "currency" | "paymentDate" | "periodFrom" | "periodTo" | "method" | "note">
>;

/** Plain field edit for correcting a mistaken entry — does not touch the Stay's period tracking. */
export async function updatePayment(id: string, patch: PaymentPatch): Promise<Payment | null> {
  const items = await getPayments();
  const index = items.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Payment = { ...items[index], ...patch };
  const next = [...items];
  next[index] = updated;
  await writeCollection(BLOB_PATH, next);
  return updated;
}

export async function deletePayment(id: string): Promise<boolean> {
  const items = await getPayments();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  await writeCollection(BLOB_PATH, next);
  return true;
}

/** Used when cascading a Stay or Resident deletion — removes every payment tied to it. */
export async function deletePaymentsForStay(stayId: string): Promise<void> {
  const items = await getPayments();
  await writeCollection(BLOB_PATH, items.filter((p) => p.stayId !== stayId));
}

export async function deletePaymentsForResident(residentId: string): Promise<void> {
  const items = await getPayments();
  await writeCollection(BLOB_PATH, items.filter((p) => p.residentId !== residentId));
}

/** Deposit currently held for a resident = deposits paid - deposit returns. Keyed by resident, not stay, so it survives a cabin move. */
export async function getDepositHeld(residentId: string): Promise<number> {
  const items = await getPaymentsForResident(residentId);
  const held = items.filter((p) => p.type === "deposit").reduce((sum, p) => sum + p.amount, 0);
  const returned = items.filter((p) => p.type === "deposit_return").reduce((sum, p) => sum + p.amount, 0);
  return held - returned;
}
