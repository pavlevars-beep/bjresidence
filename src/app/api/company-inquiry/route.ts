import { NextResponse } from "next/server";
import { formatCompanyInquiry, sendTelegramMessage } from "@/lib/telegram";

export interface CompanyInquiryPayload {
  employeeCount: number;
  arrivalDate: string;
  duration: string;
  email: string;
}

/**
 * B2B lead endpoint for the "Request Company Accommodation Quote" CTA on the
 * blog. Deliberately asks for fewer fields than /api/booking (no name/phone)
 * since this is a first-touch inquiry from an employer, not a booking.
 * Notifies the owner on Telegram, same as the main booking form.
 */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Partial<CompanyInquiryPayload> | null;

  if (!payload?.employeeCount || !payload.arrivalDate || !payload.duration || !payload.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log("[company-inquiry]", payload);

  await sendTelegramMessage(formatCompanyInquiry(payload)).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[company-inquiry] telegram notify failed:", err);
  });

  return NextResponse.json({ ok: true });
}
