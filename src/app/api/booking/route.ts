import { NextResponse } from "next/server";
import { formatBookingInquiry, sendTelegramMessage } from "@/lib/telegram";

export interface BookingPayload {
  moveInDate: string;
  duration: string;
  guests: number;
  firstName: string;
  phone: string;
  email: string;
  note?: string;
  companyInquiry?: boolean;
}

/**
 * Booking inquiry endpoint. Notifies the owner on Telegram (if configured) and
 * logs the inquiry. Swap/extend this handler to also forward `payload` to an
 * email service, Supabase table, Google Sheet, or CRM webhook.
 */
export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<BookingPayload>;

  if (!payload.firstName || !payload.phone || !payload.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log("[booking-inquiry]", payload);

  await sendTelegramMessage(formatBookingInquiry(payload)).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[booking-inquiry] telegram notify failed:", err);
  });

  return NextResponse.json({ ok: true });
}
