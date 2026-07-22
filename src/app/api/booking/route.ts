import { NextResponse } from "next/server";

export interface BookingPayload {
  moveInDate: string;
  duration: string;
  guests: number;
  parking: boolean;
  firstName: string;
  phone: string;
  email: string;
  note?: string;
  companyInquiry?: boolean;
}

/**
 * Mock booking endpoint. Swap the body of this handler to forward `payload`
 * to an email service, Supabase table, Google Sheet, or CRM webhook.
 */
export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<BookingPayload>;

  if (!payload.firstName || !payload.phone || !payload.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log("[booking-inquiry]", payload);

  return NextResponse.json({ ok: true });
}
