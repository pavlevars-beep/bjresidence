import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createPayment, getPayments, type NewPaymentInput } from "@/lib/residence/payments-store";
import { logActivity } from "@/lib/residence/activity-log-store";
import { getResident } from "@/lib/residence/residents-store";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  rent: "Kirija",
  deposit: "Depozit",
  other: "Ostalo",
  deposit_return: "Povraćaj depozita",
};

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const payments = await getPayments();
  return NextResponse.json({ ok: true, payments });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as NewPaymentInput | null;
  if (!body?.residentId || !body.cabinId || !body.stayId || !body.type || !body.amount || !body.paymentDate) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const payment = await createPayment(body);
  const resident = await getResident(body.residentId);

  await logActivity(
    "payment_added",
    `${TYPE_LABEL[payment.type] ?? payment.type} ${payment.amount}${payment.currency} — ${resident ? `${resident.firstName} ${resident.lastName}` : "gost"}`,
    "payment",
    payment.id
  );

  return NextResponse.json({ ok: true, payment });
}
